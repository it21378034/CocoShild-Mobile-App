import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import sys

MODEL_PATH = 'model.h5'
IMG_SIZE = 224
CLASS_NAMES = [
    'CCI_Caterpillars',
    'CCI_Leaflets',
    'Healthy_Leaves',
    'WCLWD_DryingofLeaflets',
    'WCLWD_Flaccidity',
    'WCLWD_Yellowing',
]

def predict(img_path):
    model = tf.keras.models.load_model(MODEL_PATH)
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x / 255.0
    preds = model.predict(x)
    class_idx = np.argmax(preds[0])
    confidence = float(preds[0][class_idx])
    return CLASS_NAMES[class_idx], confidence

if __name__ == '__main__':
    img_path = sys.argv[1]
    label, conf = predict(img_path)
    print(f'Prediction: {label} (Confidence: {conf:.2f})') 