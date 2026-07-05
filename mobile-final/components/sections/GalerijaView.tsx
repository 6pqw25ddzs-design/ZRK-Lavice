import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { getGallery } from '../../lib/api';

const GAP = 8;
const SIZE = (Dimensions.get('window').width - 32 - GAP) / 2;

export default function GalerijaScreen() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery().then(r => setImages(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && images.length === 0 && <Text style={s.empty}>Uskoro objavljujemo fotografije.</Text>}
      <View style={s.grid}>
        {images.map(img => (
          <Image key={img.id} source={{ uri: img.imageUrl }} style={s.img} />
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  img: { width: SIZE, height: SIZE, borderRadius: 12, backgroundColor: Colors.card },
});
