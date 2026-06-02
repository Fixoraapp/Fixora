import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationSelection } from '../../types/navigation';

type FixoraMapProps = {
  location: LocationSelection;
  pulseOpacity: Animated.AnimatedInterpolation<string | number>;
  pulseScale: Animated.AnimatedInterpolation<string | number>;
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#080B18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6D5DFB' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F7F8FC' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#151B35' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061D3E' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

function FixoraMap(
  { location, pulseOpacity, pulseScale }: FixoraMapProps,
  ref: React.ForwardedRef<MapView>,
) {
  const latitude = location.latitude ?? 40.1792;
  const longitude = location.longitude ?? 44.4991;

  return (
    <View style={styles.mapFrame}>
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{ latitude, longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
      >
        <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.78 }}>
          <Pin />
        </Marker>
      </MapView>
      <Animated.View pointerEvents="none" style={[styles.mapPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
      <View style={styles.mapOverlay}>
        <Text style={styles.mapOverlayText}>{location.city}</Text>
        <Text style={styles.mapOverlaySubtext}>{latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>
      </View>
    </View>
  );
}

function Pin() {
  return (
    <View style={styles.pin}>
      <LinearGradient colors={['#2B66FF', '#B931FF']} style={styles.pinHead}>
        <View style={styles.pinCore} />
      </LinearGradient>
      <View style={styles.pinTail} />
    </View>
  );
}

export default forwardRef(FixoraMap);

const styles = StyleSheet.create({
  mapFrame: {
    width: '100%',
    maxWidth: 460,
    height: 330,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.4)',
    backgroundColor: '#F7F8FC',
    shadowColor: '#2D7CFF',
    shadowOpacity: 0.38,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
  },
  mapPulse: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 130,
    height: 130,
    marginLeft: -65,
    marginTop: -65,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#B75CFF',
    backgroundColor: 'rgba(21,123,255,0.14)',
  },
  mapOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,22,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(109,93,251,0.16)',
  },
  mapOverlayText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  mapOverlaySubtext: {
    marginTop: 3,
    color: '#6D5DFB',
    fontSize: 12,
    fontWeight: '800',
  },
  pin: {
    alignItems: 'center',
    transform: [{ translateY: -10 }],
  },
  pinHead: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  pinCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111827',
  },
  pinTail: {
    width: 22,
    height: 22,
    marginTop: -9,
    backgroundColor: '#713CFF',
    transform: [{ rotate: '45deg' }],
  },
});

