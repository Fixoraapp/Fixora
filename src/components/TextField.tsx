import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { colors, radii } from '../constants/theme';

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.dim}
      selectionColor={colors.blue}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    color: colors.white,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.stroke,
    fontSize: 16,
    letterSpacing: 0,
  },
});
