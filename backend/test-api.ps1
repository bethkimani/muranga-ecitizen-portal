$base = "http://127.0.0.1:8000"
$script:pass = 0
$script:fail = 0

function Call($method, $path, $body = $null, $token = $null) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  $params = @{ Method = $method; Uri = "$base$path"; Headers = $headers; UseBasicParsing = $true }
  if ($null -ne $body) { $params.Body = ($body | ConvertTo-Json); $params.ContentType = "application/json" }
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

# Returns the items so callers can wrap with @() and count them correctly.
function Items($d) {
  if ($null -eq $d) { return @() }
  if ($d.PSObject.Properties.Name -contains 'results') { return @($d.results) }
  return @($d)
}

function Check($name, $ok, $detail = "") {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green; $script:pass++ }
  else     { Write-Host "FAIL  $name  $detail" -ForegroundColor Red; $script:fail++ }
}

# ---- Admin credentials (asked at run time, never saved in this file) ----
$adminPhone = "0703941556"
if ($env:ADMIN_PASSWORD) {
  $adminPass = $env:ADMIN_PASSWORD
} else {
  $sec = Read-Host "Admin password for $adminPhone" -AsSecureString
  $adminPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

$n = Get-Random -Minimum 10000000 -Maximum 99999999   # 8 digits
$m = Get-Random -Minimum 1000000 -Maximum 9999999     # 7 digits
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
$deptId = $cats[0].department

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

# ---- Login with phone number or email as "identifier" ----
$r = Call POST "/api/auth/login/" @{ identifier = $phoneA; password = $pw }
Check "Login with phone as identifier (200)" ($r.Status -eq 200 -and $r.Data.access) "got $($r.Status)"
$r = Call POST "/api/auth/login/" @{ identifier = "ta$n@example.com"; password = $pw }
Check "Login with email (200)" ($r.Status -eq 200 -and $r.Data.access) "got $($r.Status)"
$r = Call POST "/api/auth/login/" @{ identifier = "TA$n@EXAMPLE.COM"; password = $pw }
Check "Login with email in capitals (200)" ($r.Status -eq 200) "got $($r.Status)"
$r = Call POST "/api/auth/login/" @{ identifier = "ta$n@example.com"; password = "wrong-password" }
Check "Email with wrong password rejected (401)" ($r.Status -eq 401) "got $($r.Status)"
$r = Call POST "/api/auth/login/" @{ identifier = "nobody$n@example.com"; password = $pw }
Check "Unknown email rejected (401)" ($r.Status -eq 401) "got $($r.Status)"

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

# =====================================================================
#  ROLE-BASED ACCESS: admin, officer, department head
# =====================================================================

Write-Host "`n--- Admin login ---"
$r = Call POST "/api/auth/login/" @{ phone_number = $adminPhone; password = $adminPass }
Check "Admin can log in" ($r.Status -eq 200) "got $($r.Status)"
$adm = $r.Data.access
$r = Call GET "/api/auth/me/" $null $adm
Check "Admin role is ADMIN" ($r.Data.role -eq "ADMIN") "role is $($r.Data.role); set Role to County Admin in /admin/"

Write-Host "`n--- Admin creates staff ---"
$officerPhone = "073$m"
$headPhone    = "072$m"
$officer = @{ first_name = "Test"; last_name = "Officer"; email = "o$m@muranga.go.ke"; phone_number = $officerPhone; role = "STAFF"; department = $deptId; password = $pw }
$r = Call POST "/api/staff/" $officer $adm
Check "Admin creates officer (201)" ($r.Status -eq 201) "got $($r.Status) $($r.Data)"
$officerId = $r.Data.id

$head = @{ first_name = "Test"; last_name = "Head"; email = "h$m@muranga.go.ke"; phone_number = $headPhone; role = "DEPT_HEAD"; department = $deptId; password = $pw }
$r = Call POST "/api/staff/" $head $adm
Check "Admin creates department head (201)" ($r.Status -eq 201) "got $($r.Status) $($r.Data)"

$r = Call POST "/api/staff/" @{ first_name = "No"; email = "np$m@x.com"; phone_number = "075$m"; role = "STAFF"; department = $deptId } $adm
Check "Staff without password rejected (400)" ($r.Status -eq 400) "got $($r.Status)"

$r = Call POST "/api/staff/" @{ first_name = "Bad"; email = "b$m@x.com"; phone_number = "076$m"; role = "CITIZEN"; password = $pw } $adm
Check "Cannot create staff with CITIZEN role (400)" ($r.Status -eq 400) "got $($r.Status)"

$r = Call GET "/api/staff/" $null $adm
Check "Admin lists staff" ($r.Status -eq 200 -and @(Items $r.Data).Count -ge 2) "got $($r.Status)"

Write-Host "`n--- Citizen creates a request in the officer's department ---"
$cp = "074$m"
Call POST "/api/auth/register/" @{ phone_number = $cp; username = "c$m"; email = "c$m@example.com"; password = $pw } | Out-Null
$r = Call POST "/api/auth/login/" @{ phone_number = $cp; password = $pw }
$cit = $r.Data.access
$body2 = @{ title = "Staff test $m"; description = "x"; category = $catId; sub_county = "Kiharu"; ward = "Township"; landmark = "Market" }
$r = Call POST "/api/requests/" $body2 $cit
Check "Citizen creates request (201)" ($r.Status -eq 201) "got $($r.Status) $($r.Data)"
Check "ref_number generated" ([bool]$r.Data.ref_number) "ref_number is empty"
$req2 = $r.Data.id

Write-Host "`n--- Citizen cannot use staff features ---"
$r = Call GET "/api/staff/" $null $cit
Check "Citizen cannot list staff (403)" ($r.Status -eq 403) "got $($r.Status)"
$r = Call POST "/api/requests/$req2/status/" @{ status = "Resolved" } $cit
Check "Citizen cannot set status (403)" ($r.Status -eq 403) "got $($r.Status)"
$r = Call POST "/api/staff/" $officer $cit
Check "Citizen cannot create staff (403)" ($r.Status -eq 403) "got $($r.Status)"

Write-Host "`n--- Officer ---"
$r = Call POST "/api/auth/login/" @{ phone_number = $officerPhone; password = $pw }
Check "Officer can log in" ($r.Status -eq 200) "got $($r.Status)"
$off = $r.Data.access
$r = Call GET "/api/auth/me/" $null $off
Check "Officer role is STAFF" ($r.Data.role -eq "STAFF")
$r = Call GET "/api/staff/" $null $off
Check "Officer cannot list staff (403)" ($r.Status -eq 403) "got $($r.Status)"
$r = Call GET "/api/requests/" $null $off
Check "Officer sees the department's requests" (@(Items $r.Data | Where-Object { $_.id -eq $req2 }).Count -eq 1) "request not visible"
$r = Call POST "/api/requests/$req2/status/" @{ status = "In Progress"; note = "On site" } $off
Check "Officer sets status In Progress (200)" ($r.Status -eq 200 -and $r.Data.status -eq "In Progress") "got $($r.Status) $($r.Data)"
$r = Call POST "/api/requests/$req2/status/" @{ status = "Nonsense" } $off
Check "Invalid status rejected (400)" ($r.Status -eq 400) "got $($r.Status)"
$r = Call POST "/api/requests/$req2/assign/" @{ officer = $officerId } $off
Check "Officer cannot assign requests (403)" ($r.Status -eq 403) "got $($r.Status)"

Write-Host "`n--- Department head ---"
$r = Call POST "/api/auth/login/" @{ phone_number = $headPhone; password = $pw }
Check "Department head can log in" ($r.Status -eq 200) "got $($r.Status)"
$hd = $r.Data.access
$r = Call POST "/api/requests/$req2/assign/" @{ officer = $officerId } $hd
Check "Dept head assigns officer (200)" ($r.Status -eq 200 -and $r.Data.assigned_officer -eq $officerId) "got $($r.Status) $($r.Data)"
$r = Call POST "/api/requests/$req2/assign/" @{ officer = 999999 } $hd
Check "Assign to unknown officer rejected (400)" ($r.Status -eq 400) "got $($r.Status)"

Write-Host "`n--- Timeline ---"
$r = Call GET "/api/requests/$req2/" $null $cit
Check "Citizen sees timeline entries" (@($r.Data.timeline).Count -ge 2) "timeline has $(@($r.Data.timeline).Count) entries"
Check "Citizen sees status In Progress" ($r.Data.status -eq "In Progress")

Write-Host "`n--- Deactivation ---"
$r = Call DELETE "/api/staff/$officerId/" $null $adm
Check "Admin deactivates officer (204)" ($r.Status -eq 204) "got $($r.Status)"
$r = Call POST "/api/auth/login/" @{ phone_number = $officerPhone; password = $pw }
Check "Deactivated officer cannot log in (401)" ($r.Status -eq 401) "got $($r.Status)"

Write-Host "`n=========================================="
$color = if ($script:fail -eq 0) { "Green" } else { "Yellow" }
Write-Host "Passed: $script:pass   Failed: $script:fail" -ForegroundColor $color