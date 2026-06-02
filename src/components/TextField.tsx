import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { radii } from '../constants/theme';
import { useTheme } from '../theme/useTheme';

export function TextField(props: TextInputProps) {
  const { theme } = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.colors.dim}
      selectionColor={theme.colors.accent}
      {...props}
      style={[
        styles.input,
        {
          color: theme.colors.text,
          backgroundColor: theme.colors.input,
          borderColor: theme.colors.stroke,
          fontSize: theme.typography.body,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderRadius: radii.md,
    paddingHorizontal: 18,
    borderWidth: 1,
    letterSpacing: 0,
    fontWeight: '700',
  },
});
