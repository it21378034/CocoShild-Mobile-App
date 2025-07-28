import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Disease Case Interface
export interface DiseaseCase {
  id?: string;
  province: string;
  count: number;
  risk: 'high' | 'medium' | 'low';
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

// Officer Interface
export interface Officer {
  id?: string;
  district: string;
  officer: string;
  phone: string;
  email: string;
  createdAt: Date;
}

// Firebase Data Service
export class FirebaseDataService {
  private static instance: FirebaseDataService;

  static getInstance(): FirebaseDataService {
    if (!FirebaseDataService.instance) {
      FirebaseDataService.instance = new FirebaseDataService();
    }
    return FirebaseDataService.instance;
  }

  // Disease Cases Management
  async getDiseaseCases(): Promise<DiseaseCase[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'diseaseCases'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as DiseaseCase[];
    } catch (error) {
      console.error('Error getting disease cases:', error);
      return [];
    }
  }

  async updateDiseaseCase(province: string, count: number): Promise<boolean> {
    try {
      const q = query(collection(db, 'diseaseCases'), where('province', '==', province));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'diseaseCases', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          count: count,
          lastUpdated: new Date()
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating disease case:', error);
      return false;
    }
  }

  async addDiseaseCase(caseData: Omit<DiseaseCase, 'id' | 'lastUpdated'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'diseaseCases'), {
        ...caseData,
        lastUpdated: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding disease case:', error);
      return null;
    }
  }

  // Officers Management
  async getOfficers(): Promise<Officer[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'officers'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Officer[];
    } catch (error) {
      console.error('Error getting officers:', error);
      return [];
    }
  }

  async addOfficer(officerData: Omit<Officer, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'officers'), {
        ...officerData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding officer:', error);
      return null;
    }
  }

  async updateOfficer(id: string, officerData: Partial<Officer>): Promise<boolean> {
    try {
      const docRef = doc(db, 'officers', id);
      await updateDoc(docRef, officerData);
      return true;
    } catch (error) {
      console.error('Error updating officer:', error);
      return false;
    }
  }

  async deleteOfficer(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'officers', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting officer:', error);
      return false;
    }
  }

  // Real-time listeners
  onDiseaseCasesChange(callback: (cases: DiseaseCase[]) => void) {
    return onSnapshot(collection(db, 'diseaseCases'), (snapshot) => {
      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as DiseaseCase[];
      callback(cases);
    });
  }

  onOfficersChange(callback: (officers: Officer[]) => void) {
    return onSnapshot(collection(db, 'officers'), (snapshot) => {
      const officers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Officer[];
      callback(officers);
    });
  }
}

export default FirebaseDataService.getInstance(); 