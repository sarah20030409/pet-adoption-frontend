# Pet Adoption Website

This is a full-stack web project for a pet adoption platform.
- **Frontend**: [React.js](https://github.com/sarah20030409/pet-adoption-frontend)
- **Backend**:  [Python Flask](https://github.com/sarah20030409/pet-adoption-backend)
- **Database**: MySQL

The frontend and backend are maintained in separate repositories.

---
## 🐳 Run this project by Docker
This project uses Docker to simplify deployment. It builds a production-ready React app and serves it using **Nginx**.
### 🔧 Steps

1. Clone this repository:

    ```bash
    git clone https://github.com/sarah20030409/pet-adoption-frontend.git
    cd pet-adoption-frontend
    ```

2. Build the Docker image:

    ```bash
    docker build -t pet-frontend .
    ```

3. Run the container:

    ```bash
    docker run -p 3000:80 pet-frontend
    ```

4. Open your browser and visit:  
    [http://localhost:3000](http://localhost:3000)

---

## 📦 Installation (If you want to run without Docker)

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```
4. Visit:  
   [http://localhost:3000](http://localhost:3000)