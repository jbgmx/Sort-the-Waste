# ♻️ Sort the Waste  

A fun and educational game that helps users learn how to properly sort rubbish and recycling.  
The app combines a **Spring Boot backend** with a **simple HTML/CSS/JS frontend**.  
Players drag and drop items into the correct bins, and their scores are tracked via the backend API.

---

## 🎮 Features
- 🖱️ Drag-and-drop interface for sorting waste items.  
- 📊 Score tracking powered by a RESTful API.  
- 🧑‍💻 User-friendly design with responsive layout.  
- 🚀 Lightweight and fast — runs locally in your browser.  
- 🌱 Educational tool to promote recycling awareness.  

---

## 🛠️ Technologies Used
- ☕ **Java 17**  
- 🍃 **Spring Boot** (backend, REST API)  
- 📦 **Maven** (build & dependency management)  
- 🌐 **HTML, CSS, JavaScript** (frontend UI)  

---

## 📦 Installation

Clone the repository:  
git clone https://github.com/jbgmx/Sort-the-Waste.git  

Navigate into the project:  
cd Sort-the-Waste  

Build and run the app:  
mvn spring-boot:run  

The app will start at:  
http://localhost:8080  

---

## 🚀 Usage
1. Open the game in your browser at `http://localhost:8080`.  
2. Drag and drop waste items into the correct bins.  
3. Scores are tracked and updated in real time.  
4. Compete with friends to see who sorts the most correctly!  

---

## 📡 API Endpoints (Scores)

| Method | Endpoint       | Description            |
|--------|----------------|------------------------|
| GET    | `/api/scores`  | Fetch all saved scores |
| POST   | `/api/scores`  | Submit a new score     |

**Example (POST a score):**  
curl -X POST http://localhost:8080/api/scores \  
  -H "Content-Type: application/json" \  
  -d '{"name":"Abby","score":40}'  



