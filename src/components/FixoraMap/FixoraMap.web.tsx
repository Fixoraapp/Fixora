import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LocationSelection } from '../../types/navigation';

type FixoraMapProps = {
  location: LocationSelection;
  pulseOpacity: Animated.AnimatedInterpolation<string | number>;
  pulseScale: Animated.AnimatedInterpolation<string | number>;
};

function FixoraMap(
  { location, pulseOpacity, pulseScale }: FixoraMapProps,
  _ref: React.ForwardedRef<unknown>,
) {
  return (
    <LinearGradient colors={['#050816', '#08152E', '#120A2A']} style={styles.webMap}>
      <View style={styles.gridLayer}>
        {Array.from({ length: 10 }, (_, index) => <View key={`v-${index}`} style={[styles.gridLineVertical, { left: `${index * 11.11}%` }]} />)}
        {Array.from({ length: 7 }, (_, index) => <View key={`h-${index}`} style={[styles.gridLineHorizontal, { top: `${index * 16.66}%` }]} />)}
      </View>
      <View style={styles.routeOne} />
      <View style={styles.routeTwo} />
      <Animated.View style={[styles.mapPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
      <Pin />
      <View style={styles.copy}>
        <Text style={styles.title}>Interactive map is available on mobile</Text>
        <Text style={styles.subtitle}>Web map preview</Text>
        <Text style={styles.location}>{location.city}</Text>
      </View>
    </LinearGradient>
  );
}

function Pin() {
  return (
    <View style={styles.pin}>
      <LinearGradient colors={['#2B66FF', '#B931FF']} style={styles.pinHead}>
        <View style={styles.pinCore} />
      </LinearGradient>
      <View style={styles.pinTail} />
      <View style={styles.pinGlow} />
    </View>
  );
}

export default forwardRef(FixoraMap);

const styles = StyleSheet.create({
  webMap: {
    width: '100%',
    maxWidth: 460,
    height: 330,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.4)',
    backgroundColor: '#050816',
    shadowColor: '#157BFF',
    shadowOpacity: 0.38,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.52,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(142,167,255,0.14)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(142,167,255,0.12)',
  },
  routeOne: {
    position: 'absolute',
    left: -40,
    top: 80,
    width: 560,
    height: 92,
    borderTopWidth: 2,
    borderColor: 'rgba(21,123,255,0.32)',
    transform: [{ rotate: '-12deg' }],
  },
  routeTwo: {
    position: 'absolute',
    right: -90,
    bottom: 52,
    width: 520,
    height: 120,
    borderTopWidth: 2,
    borderColor: 'rgba(185,49,255,0.28)',
    transform: [{ rotate: '18deg' }],
  },
  mapPulse: {
    position: 'absolute',
    left: '50%',
    top: '38%',
    width: 130,
    height: 130,
    marginLeft: -65,
    marginTop: -65,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#A855F7',
    backgroundColor: 'rgba(21,123,255,0.14)',
  },
  pin: {
    position: 'absolute',
    top: 96,
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
    backgroundColor: '#FFFFFF',
  },
  pinTail: {
    width: 22,
    height: 22,
    marginTop: -9,
    backgroundColor: '#713CFF',
    transform: [{ rotate: '45deg' }],
  },
  pinGlow: {
    position: 'absolute',
    bottom: -18,
    width: 98,
    height: 24,
    borderRadius: 60,
    backgroundColor: 'rgba(21,123,255,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.54)',
  },
  copy: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    minHeight: 82,
    borderRadius: 18,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,22,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  location: {
    marginTop: 6,
    color: '#D7DDF0',
    fontSize: 12,
    fontWeight: '800',
  },
});
