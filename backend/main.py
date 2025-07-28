from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import uvicorn
import os
import pandas as pd
from typing import List, Dict
import requests
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../ml/model.h5')
TREATMENT_DATA_PATH = os.path.join(os.path.dirname(__file__), '../data_sets/yellowing_disease_treatment_data.csv')
IMG_SIZE = 224
CLASS_NAMES = [
    'CCI_Caterpillars',
    'CCI_Leaflets',
    'Healthy_Leaves',
    'WCLWD_DryingofLeaflets',
    'WCLWD_Flaccidity',
    'WCLWD_Yellowing',
]

model = load_model(MODEL_PATH)

# Load treatment dataset
def load_treatment_data():
    try:
        df = pd.read_csv(TREATMENT_DATA_PATH)
        return df
    except Exception as e:
        print(f"Error loading treatment data: {e}")
        return None

treatment_df = load_treatment_data()

# In-memory history storage (for demo)
history_db: List[Dict] = [
    {
        "result": {
            "class": "WCLWD_Yellowing",
            "confidence": 0.89
        },
        "timestamp": "2025-07-27T10:30:00Z",
        "images": ["scan_1.jpg"],
        "treatment": "Organic Pesticide Application",
        "outcome": "Ongoing",
        "cost": 2500,
        "location": "Western Province",
        "notes": "Applied neem oil treatment, monitoring progress",
        "followUpDate": "2025-08-03T10:30:00Z",
        "treatmentEffectiveness": 4
    },
    {
        "result": {
            "class": "Healthy_Leaves",
            "confidence": 0.95
        },
        "timestamp": "2025-07-26T14:15:00Z",
        "images": ["scan_2.jpg"],
        "treatment": "None Required",
        "outcome": "Resolved",
        "cost": 0,
        "location": "Central Province",
        "notes": "Plant appears healthy, no treatment needed",
        "followUpDate": None,
        "treatmentEffectiveness": 5
    },
    {
        "result": {
            "class": "CCI_Caterpillars",
            "confidence": 0.92
        },
        "timestamp": "2025-07-25T09:45:00Z",
        "images": ["scan_3.jpg"],
        "treatment": "Systemic Treatment",
        "outcome": "Resolved",
        "cost": 3200,
        "location": "Southern Province",
        "notes": "Applied systemic insecticide, caterpillars eliminated",
        "followUpDate": "2025-08-01T09:45:00Z",
        "treatmentEffectiveness": 5
    },
    {
        "result": {
            "class": "WCLWD_DryingofLeaflets",
            "confidence": 0.87
        },
        "timestamp": "2025-07-24T16:20:00Z",
        "images": ["scan_4.jpg"],
        "treatment": "Pruning and Fertilizer",
        "outcome": "Ongoing",
        "cost": 1800,
        "location": "Northern Province",
        "notes": "Pruned affected leaves, applied balanced fertilizer",
        "followUpDate": "2025-07-31T16:20:00Z",
        "treatmentEffectiveness": 3
    },
    {
        "result": {
            "class": "Healthy_Leaves",
            "confidence": 0.91
        },
        "timestamp": "2025-07-23T11:30:00Z",
        "images": ["scan_5.jpg"],
        "treatment": "None Required",
        "outcome": "Resolved",
        "cost": 0,
        "location": "Eastern Province",
        "notes": "Healthy palm, continuing regular maintenance",
        "followUpDate": None,
        "treatmentEffectiveness": 5
    },
    {
        "result": {
            "class": "WCLWD_Flaccidity",
            "confidence": 0.84
        },
        "timestamp": "2025-07-22T13:45:00Z",
        "images": ["scan_6.jpg"],
        "treatment": "Increased Irrigation",
        "outcome": "Failed",
        "cost": 1200,
        "location": "North Western Province",
        "notes": "Increased irrigation but condition worsened",
        "followUpDate": "2025-07-29T13:45:00Z",
        "treatmentEffectiveness": 2
    }
]

# In-memory report cases storage (for demo)
report_cases_db: List[Dict] = []

OPENWEATHER_API_KEY = 'demo'  # Replace with your real API key

push_tokens = set()

@app.post('/register-push-token')
def register_push_token(token: str):
    push_tokens.add(token)
    return {"status": "registered", "token": token}

def send_push_notification(title, body):
    if not push_tokens:
        return
    messages = [{
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
    } for token in push_tokens]
    response = requests.post(
        "https://exp.host/--/api/v2/push/send",
        json=messages,
        headers={"Content-Type": "application/json"}
    )
    print("Expo push response:", response.json())

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    with open('temp.jpg', 'wb') as f:
        f.write(contents)
    img = image.load_img('temp.jpg', target_size=(IMG_SIZE, IMG_SIZE))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x / 255.0
    preds = model.predict(x)
    class_idx = int(np.argmax(preds[0]))
    confidence = float(preds[0][class_idx])
    os.remove('temp.jpg')
    result = {"class": CLASS_NAMES[class_idx], "confidence": confidence}
    # Save to history
    history_db.append({"result": result})
    return result

@app.post('/diagnose-multiple')
async def diagnose_multiple(files: List[UploadFile] = File(None), images: List[UploadFile] = File(None)):
    """Diagnose multiple images and return disease prediction with treatment recommendations"""
    # Handle both parameter names
    uploaded_files = files if files else (images if images else [])
    if len(uploaded_files) == 0:
        return {"error": "No images provided"}
    
    try:
        predictions = []
        for i, file in enumerate(uploaded_files):
            contents = await file.read()
            temp_filename = f'temp_{i}.jpg'
            with open(temp_filename, 'wb') as f:
                f.write(contents)
            
            img = image.load_img(temp_filename, target_size=(IMG_SIZE, IMG_SIZE))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = x / 255.0
            preds = model.predict(x)
            class_idx = int(np.argmax(preds[0]))
            confidence = float(preds[0][class_idx])
            
            predictions.append({
                "image_index": i,
                "class": CLASS_NAMES[class_idx],
                "confidence": confidence
            })
            
            os.remove(temp_filename)
        
        # Get the most confident prediction
        best_prediction = max(predictions, key=lambda x: x['confidence'])
        disease_class = best_prediction['class']
        
        # Get treatment recommendations for the predicted disease
        treatment_recommendations = get_treatment_for_disease(disease_class)
        
        # Save to history
        history_db.append({
            "predictions": predictions,
            "best_prediction": best_prediction,
            "treatment": treatment_recommendations
        })
        
        return {
            "predictions": predictions,
            "best_prediction": best_prediction,
            "treatment": treatment_recommendations,
            "message": f"Diagnosed as {disease_class} with {best_prediction['confidence']:.2%} confidence"
        }
        
    except Exception as e:
        return {"error": f"Diagnosis failed: {str(e)}"}

def get_treatment_for_disease(disease_class: str):
    """Get treatment recommendations for a specific disease class"""
    # Map disease classes to relevant symptoms
    symptom_mapping = {
        'Healthy_Leaves': 'healthy',
        'WCLWD_Yellowing': 'yellowing',
        'WCLWD_DryingofLeaflets': 'dieback',
        'WCLWD_Flaccidity': 'wilting',
        'CCI_Caterpillars': 'stunted',
        'CCI_Leaflets': 'flower drop'
    }
    
    symptom = symptom_mapping.get(disease_class, '')
    
    if disease_class == 'Healthy_Leaves':
        return {
            "title": "Healthy Coconut Palm",
            "message": "Your coconut palm appears to be healthy!",
            "recommendations": [
                "Continue regular maintenance practices",
                "Monitor for early signs of disease",
                "Maintain proper irrigation and fertilization",
                "Practice good field sanitation"
            ],
            "severity": "None",
            "urgency": "Low"
        }
    
    # Get specific treatments from the dataset
    if treatment_df is not None and symptom:
        try:
            relevant_treatments = treatment_df[
                treatment_df['Symptom'].str.contains(symptom, case=False, na=False)
            ]
            
            if not relevant_treatments.empty:
                # Get early stage treatments first
                early_treatments = relevant_treatments[
                    relevant_treatments['Stage'].str.contains('Early', case=False, na=False)
                ]
                
                if not early_treatments.empty:
                    treatments = early_treatments.head(3)
                else:
                    treatments = relevant_treatments.head(3)
                
                recommendations = []
                for _, treatment in treatments.iterrows():
                    rec = f"{treatment['Treatment']} (Organic: {treatment['Organic_Alternative']})"
                    if pd.notna(treatment['Notes']):
                        rec += f" - {treatment['Notes']}"
                    recommendations.append(rec)
                
                # Determine severity and urgency based on disease class
                severity_map = {
                    'WCLWD_Yellowing': 'High',
                    'WCLWD_DryingofLeaflets': 'High',
                    'WCLWD_Flaccidity': 'Medium',
                    'CCI_Caterpillars': 'Medium',
                    'CCI_Leaflets': 'Low'
                }
                
                urgency_map = {
                    'WCLWD_Yellowing': 'Immediate',
                    'WCLWD_DryingofLeaflets': 'Immediate',
                    'WCLWD_Flaccidity': 'High',
                    'CCI_Caterpillars': 'Medium',
                    'CCI_Leaflets': 'Low'
                }
                
                return {
                    "title": f"Treatment for {disease_class}",
                    "message": f"Detected {disease_class} - Treatment required",
                    "recommendations": recommendations,
                    "severity": severity_map.get(disease_class, 'Medium'),
                    "urgency": urgency_map.get(disease_class, 'Medium'),
                    "source": "Treatment Dataset"
                }
        except Exception as e:
            print(f"Error processing treatment data: {e}")
    
    # Fallback to generic recommendations
    return {
        "title": f"Treatment for {disease_class}",
        "message": "Treatment recommendations based on disease detection",
        "recommendations": [
            "Consult an agriculture officer for proper diagnosis",
            "Apply recommended treatments based on local guidelines",
            "Monitor the affected area regularly",
            "Isolate infected plants if possible"
        ],
        "severity": "Medium",
        "urgency": "Medium",
        "source": "Generic Recommendations"
    }

@app.get('/history')
def get_history():
    print(f"📊 History endpoint called - returning {len(history_db)} items")
    print(f"📋 History data: {history_db}")
    return {"history": history_db}

@app.post('/history')
def add_history(item: Dict):
    history_db.append(item)
    return {"status": "added", "item": item}

@app.get('/weather')
def get_weather(lat: float = 0.0, lon: float = 0.0):
    # Mock weather data
    return {
        "location": {"lat": lat, "lon": lon},
        "temperature": 30.5,
        "humidity": 80,
        "rainfall": 12.3,
        "description": "Mock: Hot and humid, risk of disease spread."
    }

@app.post('/report')
def report_symptoms(text: str = Form(...)):
    # Mock NLP classification
    if "yellow" in text.lower():
        label = "Possible Lethal Yellowing"
    else:
        label = "Unknown/Other"
    return {"input": text, "classification": label}

@app.get('/officers')
def get_officers(lat: float = 0.0, lon: float = 0.0):
    # Mock officer data
    return {
        "officers": [
            {"name": "Officer A", "phone": "+1234567890", "distance_km": 2.1},
            {"name": "Officer B", "phone": "+0987654321", "distance_km": 5.4}
        ]
    }

@app.get('/farm-stats')
def get_farm_stats():
    total = len(history_db)
    healthy = sum(1 for h in history_db if h['result']['class'] == 'Healthy_Leaves')
    at_risk = total - healthy
    return {"total": total, "healthy": healthy, "at_risk": at_risk}

@app.get('/weather-risk')
def get_weather_risk(lat: float = 0.0, lon: float = 0.0):
    # For demo, use OpenWeatherMap free API (replace 'demo' with your key)
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        resp = requests.get(url)
        data = resp.json()
        temp = data['main']['temp']
        humidity = data['main']['humidity']
        weather = data['weather'][0]['description']
    except Exception:
        temp = 32
        humidity = 78
        weather = 'Partly Cloudy'
    # Simple risk logic
    if humidity > 75 and temp > 28:
        risk = 'MEDIUM'
        risk_msg = 'Moderate risk conditions. Regular monitoring advised.'
    else:
        risk = 'LOW'
        risk_msg = 'Low risk.'
    return {
        "condition": weather,
        "temp": temp,
        "humidity": humidity,
        "risk": risk,
        "riskMsg": risk_msg
    }

@app.post('/alerts')
def create_alert(title: str, msg: str):
    # Add alert to your alerts list/db here (for demo, just send notification)
    send_push_notification(title, msg)
    return {"status": "alert sent", "title": title, "msg": msg}

@app.get('/alerts')
def get_alerts():
    # Mock alerts
    return {"alerts": [
        {"id": 1, "type": "danger", "title": "LYD Outbreak Detected", "msg": "Immediate action required in Zone 3."}
    ]}

@app.get('/treatments')
def get_treatments(symptom: str = None, stage: str = None):
    """Get treatment recommendations from the dataset"""
    if treatment_df is None:
        return {"error": "Treatment data not available"}
    
    df = treatment_df.copy()
    
    if symptom:
        df = df[df['Symptom'].str.contains(symptom, case=False, na=False)]
    
    if stage:
        df = df[df['Stage'].str.contains(stage, case=False, na=False)]
    
    if df.empty:
        return {"message": "No treatments found for the specified criteria"}
    
    treatments = df.to_dict('records')
    return {"treatments": treatments}

@app.get('/test')
def test_connection():
    """Simple test endpoint to verify connectivity"""
    return {
        "status": "success",
        "message": "Backend is running and accessible",
        "timestamp": str(datetime.now()),
        "treatment_data_loaded": treatment_df is not None,
        "treatment_count": len(treatment_df) if treatment_df is not None else 0,
        "endpoints": [
            "/test",
            "/treatments", 
            "/diagnose-multiple",
            "/predict",
            "/recommendations"
        ]
    }

@app.post('/test-upload')
async def test_upload(file: UploadFile = File(...)):
    """Test endpoint for file upload"""
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(await file.read())
    }

@app.post('/validate-coconut-leaf')
async def validate_coconut_leaf(file: UploadFile = File(...)):
    """Validate if the uploaded image is a coconut leaf"""
    try:
        contents = await file.read()
        with open('temp_validation.jpg', 'wb') as f:
            f.write(contents)
        
        img = image.load_img('temp_validation.jpg', target_size=(IMG_SIZE, IMG_SIZE))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = x / 255.0
        preds = model.predict(x)
        class_idx = int(np.argmax(preds[0]))
        confidence = float(preds[0][class_idx])
        predicted_class = CLASS_NAMES[class_idx]
        
        os.remove('temp_validation.jpg')
        
        # Check if the predicted class is a coconut-related class
        coconut_classes = [
            'CCI_Caterpillars',
            'CCI_Leaflets', 
            'Healthy_Leaves',
            'WCLWD_DryingofLeaflets',
            'WCLWD_Flaccidity',
            'WCLWD_Yellowing'
        ]
        
        is_valid = predicted_class in coconut_classes and confidence > 0.3
        
        return {
            "is_valid": is_valid,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "message": f"Predicted: {predicted_class} ({confidence:.2%} confidence)",
            "validation_passed": is_valid
        }
        
    except Exception as e:
        return {
            "is_valid": False,
            "error": str(e),
            "message": "Failed to validate image"
        }

@app.get('/recommendations')
def get_recommendations(disease_class: str):
    """Enhanced recommendations using the treatment dataset"""
    
    # Map disease classes to relevant symptoms
    symptom_mapping = {
        'Healthy_Leaves': 'healthy',
        'WCLWD_Yellowing': 'yellowing',
        'WCLWD_DryingofLeaflets': 'dieback',
        'WCLWD_Flaccidity': 'wilting',
        'CCI_Caterpillars': 'stunted',
        'CCI_Leaflets': 'flower drop'
    }
    
    # Get relevant symptom for the disease class
    symptom = symptom_mapping.get(disease_class, '')
    
    if disease_class == 'Healthy_Leaves':
        return {
            "title": "Best Practices for Healthy Palms",
            "recommendations": [
                "Maintain regular irrigation and balanced fertilization.",
                "Monitor for early signs of disease or pests.",
                "Practice good field sanitation.",
                "Apply preventive treatments like neem oil every 2 weeks.",
                "Ensure proper soil drainage and avoid overwatering."
            ],
            "source": "Treatment Dataset"
        }
    
    # Try to get specific treatments from the dataset
    if treatment_df is not None and symptom:
        try:
            # Filter treatments based on symptom
            relevant_treatments = treatment_df[
                treatment_df['Symptom'].str.contains(symptom, case=False, na=False)
            ]
            
            if not relevant_treatments.empty:
                # Get early stage treatments first
                early_treatments = relevant_treatments[
                    relevant_treatments['Stage'].str.contains('Early', case=False, na=False)
                ]
                
                if not early_treatments.empty:
                    treatments = early_treatments.head(3)
                else:
                    treatments = relevant_treatments.head(3)
                
                recommendations = []
                for _, treatment in treatments.iterrows():
                    rec = f"{treatment['Treatment']} (Organic: {treatment['Organic_Alternative']})"
                    if pd.notna(treatment['Notes']):
                        rec += f" - {treatment['Notes']}"
                    recommendations.append(rec)
                
                return {
                    "title": f"Treatment for {disease_class}",
                    "recommendations": recommendations,
                    "source": "Treatment Dataset",
                    "stage": "Early intervention recommended"
                }
        except Exception as e:
            print(f"Error processing treatment data: {e}")
    
    # Fallback to generic recommendations
    if 'yellow' in disease_class.lower() or 'early' in disease_class.lower():
        return {
            "title": "Treatment for Early Signs of LYD",
            "recommendations": [
                "Apply recommended organic or chemical treatments (consult local guidelines).",
                "Remove and destroy affected fronds if possible.",
                "Increase monitoring frequency for nearby palms.",
                "Use systemic insecticides for early intervention.",
                "Apply neem oil every 2 weeks as preventive measure."
            ],
            "source": "Generic Recommendations"
        }
    elif 'severe' in disease_class.lower() or 'risk' in disease_class.lower() or 'caterpillar' in disease_class.lower():
        return {
            "title": "Severe Infection Management",
            "recommendations": [
                "Prune or remove severely affected palms to prevent spread.",
                "Disinfect tools after use.",
                "Consult an agriculture officer for further action.",
                "Apply tetracycline via trunk injection if appropriate.",
                "Isolate infected palms from healthy ones."
            ],
            "source": "Generic Recommendations"
        }
    else:
        return {
            "title": "General Advice",
            "recommendations": [
                "Monitor palms regularly.",
                "Consult an agriculture officer for diagnosis and treatment.",
                "Apply copper-based fungicide if fungal infection suspected.",
                "Improve soil drainage and avoid overwatering.",
                "Use beneficial mycorrhizae for soil health."
            ],
            "source": "Generic Recommendations"
        }

# Report Case Endpoints
@app.post('/report-case')
async def create_report_case(report_case: dict):
    """Create a new report case"""
    try:
        # Add ID and timestamps
        report_case['id'] = f"report_{len(report_cases_db) + 1}"
        report_case['createdAt'] = datetime.now().isoformat()
        report_case['updatedAt'] = datetime.now().isoformat()
        
        # Add to database
        report_cases_db.append(report_case)
        
        return {"success": True, "report_id": report_case['id']}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get('/report-cases')
async def get_report_cases(userId: str = None):
    """Get report cases for a user or all cases for admin"""
    try:
        if userId:
            # Filter by user ID
            user_reports = [r for r in report_cases_db if r.get('userId') == userId]
            return {"reports": user_reports}
        else:
            # Return all reports (for admin)
            return {"reports": report_cases_db}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post('/analyze-text')
async def analyze_text(data: dict):
    """Analyze text using NLP for sentiment, keywords, and urgency"""
    try:
        text = data.get('text', '')
        language = data.get('language', 'english')
        
        # Simple NLP analysis (in production, use proper NLP libraries)
        words = text.lower().split()
        
        # Sentiment analysis (simple keyword-based)
        positive_words = ['good', 'healthy', 'improving', 'better', 'recovered', 'සුභ', 'හොඳ', 'ඉහළ', 'උසස්']
        negative_words = ['bad', 'worse', 'dying', 'dead', 'sick', 'disease', 'කරදර', 'රෝග', 'මරණ', 'අසනීප']
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        if positive_count > negative_count:
            sentiment = 'positive'
        elif negative_count > positive_count:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Extract keywords (simple approach)
        keywords = [word for word in words if len(word) > 3 and word not in ['the', 'and', 'for', 'with', 'this', 'that']]
        keywords = keywords[:5]  # Limit to 5 keywords
        
        # Determine urgency based on keywords and sentiment
        urgency_keywords = ['urgent', 'emergency', 'dying', 'dead', 'immediate', 'හදිසි', 'අනතුර', 'මරණ']
        urgency = 0.5  # Default medium urgency
        
        if any(word in urgency_keywords for word in words):
            urgency = 0.9
        elif sentiment == 'negative':
            urgency = 0.7
        elif sentiment == 'positive':
            urgency = 0.3
        
        # Categorize based on keywords
        category = 'general'
        if any(word in ['disease', 'sick', 'yellow', 'රෝග', 'අසනීප'] for word in words):
            category = 'disease'
        elif any(word in ['pest', 'insect', 'bug', 'කෘමි', 'බූ'] for word in words):
            category = 'pest'
        elif any(word in ['water', 'irrigation', 'drought', 'ජල', 'වියළි'] for word in words):
            category = 'irrigation'
        
        return {
            "sentiment": sentiment,
            "keywords": keywords,
            "category": category,
            "urgency": urgency,
            "language": language
        }
    except Exception as e:
        return {"error": str(e)}

@app.post('/admin-reply')
async def add_admin_reply(data: dict):
    """Add admin reply to a report case"""
    try:
        report_id = data.get('reportId')
        admin_id = data.get('adminId')
        admin_name = data.get('adminName')
        message = data.get('message')
        
        # Find the report
        report = next((r for r in report_cases_db if r['id'] == report_id), None)
        if not report:
            return {"success": False, "error": "Report not found"}
        
        # Add reply
        reply = {
            "id": f"reply_{len(report.get('adminReplies', [])) + 1}",
            "adminId": admin_id,
            "adminName": admin_name,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        if 'adminReplies' not in report:
            report['adminReplies'] = []
        report['adminReplies'].append(reply)
        report['updatedAt'] = datetime.now().isoformat()
        
        return {"success": True, "reply_id": reply['id']}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.put('/report-case/{report_id}/status')
async def update_report_status(report_id: str, status: str):
    """Update report case status"""
    try:
        report = next((r for r in report_cases_db if r['id'] == report_id), None)
        if not report:
            return {"success": False, "error": "Report not found"}
        
        report['status'] = status
        report['updatedAt'] = datetime.now().isoformat()
        
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 