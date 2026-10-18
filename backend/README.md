


---

## 2. Backend Repository (`muranga-ecitizen-backend/README.md`)

```markdown
#  Murang'a County e-Citizen Portal — Backend REST API

A secure, scalable RESTful API powering digital governance workflows for Murang'a County, Kenya. Built with Django, Django REST Framework, Neon PostgreSQL, Celery/Redis, and Africa's Talking Kenya SMS gateway.

---

##  Key Architectural Features

* **Custom Role-Based Access Control (RBAC)**:
  * User Roles: `Citizen`, `Field/Desk Officer`, `Department Head`, and `County Admin`.
  * Secured via JWT (`djangorestframework-simplejwt`).
* **Domain Driven Application Architecture**:
  * `users`: Auth, custom user model, and ward/sub-county profiles.
  * `categories`: County departments and service category models.
  * `service_requests`: Public issue reports, location mapping, evidence links, and timeline logs.
  * `announcements`: Ward-level county notifications and announcements.
  * `notifications`: User alert notifications and Africa's Talking Kenya SMS triggers.
  * `audit_logs`: Immutable, append-only transaction audit trail integrated with `django-auditlog`.
* **Asynchronous Kenya SMS Delivery**:
  * Asynchronous status-update dispatch via Celery & Redis using **Africa's Talking API**.
* **Database & Production Ready**:
  * Serverless **Neon PostgreSQL** integration via `dj-database-url`.
  * Static file handling powered by WhiteNoise and WSGI serving via Gunicorn.

---

##  Tech Stack

* **Language**: Python 3.12+
* **Framework**: Django 6.1, Django REST Framework (DRF)
* **Database**: Neon PostgreSQL
* **Task Queue & Cache**: Celery + Redis
* **SMS Gateway**: Africa's Talking (Kenya)
* **Audit Trail**: `django-auditlog`
* **Production Server**: Gunicorn + WhiteNoise

---

## 📁 Repository Structure

```text
muranga-ecitizen-backend/
├── config/                      # Project core settings, URLs, WSGI, Celery config
│   ├── celery.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                        # Modular domain applications
│   ├── announcements/
│   ├── audit_logs/
│   ├── categories/
│   ├── notifications/
│   ├── service_requests/
│   └── users/
├── manage.py
├── Procfile                     # Deployment process manager
├── requirements.txt
└── .env.example
# Local Development Setup
Prerequisites
Python 3.11 or higher

PostgreSQL database (or Neon connection string)

Redis server (for background Celery tasks)

Steps
Clone the repository:

Bash
git clone [https://github.com/bethkimani/muranga-ecitizen-backend.git](https://github.com/bethkimani/muranga-ecitizen-backend.git)
cd muranga-ecitizen-backend
Create and activate a virtual environment:

Windows (PowerShell):

PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
Linux/macOS:

Bash
python3 -m venv venv
source venv/bin/activate
Install dependencies:

Bash
pip install -r requirements.txt
Set Environment Variables:
Create a .env file in the root directory:

Code snippet
SECRET_KEY=your-secure-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require
AT_USERNAME=sandbox
AT_API_KEY=your_africastalking_api_key
REDIS_URL=redis://localhost:6379/0
Apply Database Migrations:

Bash
python manage.py makemigrations
python manage.py migrate
Create Admin Superuser:

Bash
python manage.py createsuperuser
Run Development Server:

Bash
python manage.py runserver 8000
Access API Documentation & Admin Panel:

API Base URL: http://localhost:8000/api/

Django Admin: http://localhost:8000/admin/

☁️ Production Deployment (Render)
Build Command
Bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
Start Command

#Bash
gunicorn config.wsgi:application
