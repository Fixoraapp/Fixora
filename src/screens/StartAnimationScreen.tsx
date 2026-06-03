import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';

type StartAnimationScreenProps = {
  onFinish: () => void;
};

const letters = ['F', 'i', 'x', 'o', 'r', 'a'];

export default function StartAnimationScreen({ onFinish }: StartAnimationScreenProps) {
  const logoDrop = useRef(new Animated.Value(0)).current;
  const slogan = useRef(new Animated.Value(0)).current;
  const letterValues = useMemo(() => letters.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoDrop, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.back(1.15)),
        useNativeDriver: true,
      }),
      Animated.stagger(
        90,
        letterValues.map((value) => Animated.timing(value, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })),
      ),
      Animated.timing(slogan, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [letterValues, logoDrop, onFinish, slogan]);

  return (
    <LinearGradient colors={['#03040A', '#071124', '#0B0618']} style={styles.screen}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoDrop,
            transform: [{ translateY: logoDrop.interpolate({ inputRange: [0, 1], outputRange: [-220, 0] }) }],
          },
        ]}
      >
        <FixoraLogo size={104} />
      </Animated.View>

      <View style={styles.word}>
        {letters.map((letter, index) => {
          const value = letterValues[index];
          const fromX = index % 2 === 0 ? -90 : 90;
          const fromY = index % 3 === 0 ? 54 : -44;
          return (
            <Animated.Text
              key={letter + index}
              style={[
                styles.letter,
                {
                  opacity: value,
                  transform: [
                    { translateX: value.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] }) },
                    { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
                  ],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          );
        })}
      </View>

      <Animated.Text
        style={[
          styles.slogan,
          {
            opacity: slogan,
            transform: [{ translateY: slogan.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
          },
        ]}
      >
        Find trusted professionals instantly.
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    marginBottom: 24,
  },
  word: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letter: {
    color: '#F8FAFF',
    fontSize: 58,
    lineHeight: 68,
    fontWeight: '900',
  },
  slogan: {
    marginTop: 12,
    color: '#DDE6FF',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
});
