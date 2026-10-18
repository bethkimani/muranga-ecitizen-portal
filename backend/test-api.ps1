$base = "http://127.0.0.1:8000"
$script:pass = 0
$script:fail = 0

function Call($method, $path, $body = $null, $token = $null) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  $params = @{ Method = $method; Uri = "$base$path"; Headers = $headers; UseBasicParsing = $true }
  if ($body) { $params.Body = ($body | ConvertTo-Json); $params.ContentType = "application/json" }
  try {
    $r = Invoke-WebRequest @params
    $data = $null
    if ($r.Content) { $data = $r.Content | ConvertFrom-Json }
    return @{ Status = [int]$r.StatusCode; Data = $data }
  } catch {
    $status = 0
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    return @{ Status = $status; Data = $_.ErrorDetails.Message }
  }
}

# Always returns an array, even for 0 or 1 items.
function Items($d) {
  if ($null -eq $d) { return ,@() }
  if ($d.PSObject.Properties.Name -contains 'results') { return ,@($d.results) }
  return ,@($d)
}

function Check($name, $ok, $detail = "") {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green; $script:pass++ }
  else     { Write-Host "FAIL  $name  $detail" -ForegroundColor Red; $script:fail++ }
}

$n = Get-Random -Minimum 10000000 -Maximum 99999999
$phoneA = "07$n"
$phoneB = "01$n"
$pw = "StrongPass123!"

Write-Host "`n--- Public endpoints ---"
$r = Call GET "/"
Check "GET / returns 200" ($r.Status -eq 200) "got $($r.Status)"
$r = Call GET "/api/departments/"
Check "GET /api/departments/ returns 200" ($r.Status -eq 200) "got $($r.Status)"
$r = Call GET "/api/categories/"
Check "GET /api/categories/ returns 200" ($r.Status -eq 200) "got $($r.Status)"
$cats = @(Items $r.Data)
Check "At least one category exists" ($cats.Count -ge 1 -and $null -ne $cats[0].id) "add one in /admin/"
$catId = $cats[0].id

Write-Host "`n--- Registration ---"
$userA = @{ phone_number = $phoneA; username = "ta$n"; email = "ta$n@example.com"; password = $pw }
$r = Call POST "/api/auth/register/" $userA
Check "Register user A (201)" ($r.Status -eq 201) "got $($r.Status) $($r.Data)"
$r = Call POST "/api/auth/register/" $userA
Check "Duplicate registration rejected (400)" ($r.Status -eq 400) "got $($r.Status)"
$r = Call POST "/api/auth/register/" @{ username = "x" }
Check "Register with missing fields rejected (400)" ($r.Status -eq 400) "got $($r.Status)"
$evil = @{ phone_number = $phoneB; username = "tb$n"; email = "tb$n@example.com"; password = $pw; role = "ADMIN"; is_staff = $true; is_superuser = $true }
$r = Call POST "/api/auth/register/" $evil
Check "Register user B (201)" ($r.Status -eq 201) "got $($r.Status) $($r.Data)"

Write-Host "`n--- Login and tokens ---"
$r = Call POST "/api/auth/login/" @{ phone_number = $phoneA; password = "wrong-password" }
Check "Wrong password rejected (401)" ($r.Status -eq 401) "got $($r.Status)"
$r = Call POST "/api/auth/login/" @{ phone_number = $phoneA; password = $pw }
Check "Login user A (200, has access and refresh)" ($r.Status -eq 200 -and $r.Data.access -and $r.Data.refresh) "got $($r.Status)"
$tokA = $r.Data.access
$refA = $r.Data.refresh
$r = Call POST "/api/auth/login/" @{ phone_number = $phoneB; password = $pw }
$tokB = $r.Data.access
Check "Login user B (200)" ($r.Status -eq 200) "got $($r.Status)"
$r = Call POST "/api/auth/refresh/" @{ refresh = $refA }
Check "Refresh token returns new access (200)" ($r.Status -eq 200 -and $r.Data.access) "got $($r.Status)"

Write-Host "`n--- Current user ---"
$r = Call GET "/api/auth/me/"
Check "GET /me/ without token rejected (401)" ($r.Status -eq 401) "got $($r.Status)"
$r = Call GET "/api/auth/me/" $null $tokA
Check "GET /me/ returns user A" ($r.Status -eq 200 -and $r.Data.phone_number -eq $phoneA) "got $($r.Status)"
Check "New user role is CITIZEN" ($r.Data.role -eq "CITIZEN")
$r = Call GET "/api/auth/me/" $null $tokB
Check "User B could NOT self-assign ADMIN role" ($r.Data.role -eq "CITIZEN") "role is $($r.Data.role)"

Write-Host "`n--- Service requests ---"
$r = Call GET "/api/requests/"
Check "List requests without token rejected (401)" ($r.Status -eq 401) "got $($r.Status)"
$body = @{ title = "Test burst pipe $n"; description = "Water on road"; category = $catId; sub_county = "Kiharu"; ward = "Township"; landmark = "Near market" }
$r = Call POST "/api/requests/" $body
Check "Create request without token rejected (401)" ($r.Status -eq 401) "got $($r.Status)"
$r = Call POST "/api/requests/" @{ title = "incomplete" } $tokA
Check "Create request with missing fields rejected (400)" ($r.Status -eq 400) "got $($r.Status)"
$r = Call POST "/api/requests/" $body $tokA
Check "Create request as A (201)" ($r.Status -eq 201) "got $($r.Status) $($r.Data)"
Check "ref_number was generated" ([bool]$r.Data.ref_number)
Check "Status starts as Pending" ($r.Data.status -eq "Pending") "got $($r.Data.status)"
$reqId = $r.Data.id

$r = Call GET "/api/requests/" $null $tokA
$mine = @(Items $r.Data | Where-Object { $_.id -eq $reqId })
Check "A sees own request in list" ($mine.Count -eq 1)
$r = Call GET "/api/requests/$reqId/" $null $tokA
Check "A can open own request (200)" ($r.Status -eq 200) "got $($r.Status)"

Write-Host "`n--- Privacy: user B must not reach A's data ---"
$r = Call GET "/api/requests/" $null $tokB
$leak = @(Items $r.Data | Where-Object { $_.id -eq $reqId })
Check "B's list does not contain A's request" ($leak.Count -eq 0) "DATA LEAK"
$r = Call GET "/api/requests/$reqId/" $null $tokB
Check "B cannot open A's request (404 or 403)" ($r.Status -in 403, 404) "got $($r.Status) DATA LEAK"
$r = Call PATCH "/api/requests/$reqId/" @{ title = "hacked" } $tokB
Check "B cannot edit A's request (404 or 403)" ($r.Status -in 403, 404) "got $($r.Status)"
$r = Call DELETE "/api/requests/$reqId/" $null $tokB
Check "B cannot delete A's request (404 or 403)" ($r.Status -in 403, 404) "got $($r.Status)"

Write-Host "`n--- Citizen must not control workflow ---"
$r = Call PATCH "/api/requests/$reqId/" @{ status = "Resolved" } $tokA
$r2 = Call GET "/api/requests/$reqId/" $null $tokA
Check "Citizen cannot mark own request Resolved" ($r2.Data.status -ne "Resolved") "citizen changed status; restrict this to staff"

Write-Host "`n--- Read-only reference data ---"
$r = Call POST "/api/categories/" @{ name = "Hack"; description = "x"; department = 1 } $tokA
Check "Citizen cannot create categories (401/403/405)" ($r.Status -in 401, 403, 405) "got $($r.Status)"
$r = Call POST "/api/departments/" @{ name = "Hack" } $tokA
Check "Citizen cannot create departments (401/403/405)" ($r.Status -in 401, 403, 405) "got $($r.Status)"

Write-Host "`n=========================================="
$color = if ($script:fail -eq 0) { "Green" } else { "Yellow" }
Write-Host "Passed: $script:pass   Failed: $script:fail" -ForegroundColor $color