import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

# Dataset paths
base_dir = '../data_sets/Cocounet_Leafe_Dataset'
class_dirs = [
    'CCI_Caterpillars/CCI_Caterpillars',
    'CCI_Leaflets/CCI_Leaflets',
    'Healthy_Leaves/Healthy_Leaves',
    'WCLWD_DryingofLeaflets/WCLWD_DryingofLeaflets',
    'WCLWD_Flaccidity/WCLWD_Flaccidity',
    'WCLWD_Yellowing/WCLWD_Yellowing',
]

# Prepare a single directory structure for flow_from_directory
train_dir = 'train_data'
os.makedirs(train_dir, exist_ok=True)
for class_dir in class_dirs:
    class_name = class_dir.split('/')[0]
    class_path = os.path.join(train_dir, class_name)
    os.makedirs(class_path, exist_ok=True)
    src_path = os.path.join(base_dir, class_dir)
    for fname in os.listdir(src_path):
        src = os.path.join(src_path, fname)
        dst = os.path.join(class_path, fname)
        if not os.path.exists(dst):
            try:
                os.symlink(os.path.abspath(src), dst)
            except Exception:
                import shutil
                shutil.copy2(src, dst)

# Image parameters
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10

# Data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

val_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

# Model
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
predictions = Dense(train_generator.num_classes, activation='softmax')(x)
model = Model(inputs=base_model.input, outputs=predictions)

for layer in base_model.layers:
    layer.trainable = False

model.compile(optimizer=Adam(learning_rate=1e-4), loss='categorical_crossentropy', metrics=['accuracy'])

model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator
)

model.save('model.h5')
print('Model training complete and saved as model.h5') 