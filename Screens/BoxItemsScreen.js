import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BoxItemsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { wardrobeId, boxName } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      console.log(`Fetching items for wardrobeId: ${wardrobeId}, boxName: '${boxName}'`);
      setLoading(true);
      try {
        const itemsRef = collection(db, 'wardrobes', wardrobeId, 'items');
        const q = query(itemsRef, where('selectedBox', '==', boxName));
        const querySnapshot = await getDocs(q);
        
        console.log(`Found ${querySnapshot.size} items in Firestore.`);

        const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (fetchedItems.length > 0) {
            console.log('Fetched items:', JSON.stringify(fetchedItems, null, 2));
        }

        setItems(fetchedItems);
      } catch (error) {
        console.error(`Error fetching items for box ${boxName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (wardrobeId && boxName) {
        fetchItems();
    } else {
        console.error("wardrobeId or boxName is missing.");
        setLoading(false);
    }
  }, [wardrobeId, boxName]);

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Outfit:</Text> {item.outfitType}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Type:</Text> {item.clothingType}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Color:</Text> {item.Colour}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Material:</Text> {item.stuff}</Text>
        {item.Detail ? <Text style={styles.detailText}><Text style={styles.detailLabel}>Details:</Text> {item.Detail}</Text> : null}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#F5EADD', '#C5A78F']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#6B4F4B" />
      </TouchableOpacity>
      <Text style={styles.header}>{boxName}</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#A0785A" style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyMessage}>You have not added any item in this box.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4F4B',
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#6B4F4B',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#6B4F4B',
  },
});

export default BoxItemsScreen;
