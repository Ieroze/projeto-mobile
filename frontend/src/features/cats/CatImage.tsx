import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

import { ColorPalette, useColors, useThemedStyles } from '../../theme';
import { Cat } from '../../types/cat';

interface Props {
  cat: Cat;
  style: StyleProp<ImageStyle>;
  iconSize?: number;
}

export function CatImage({ cat, style, iconSize = 32 }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setFailed(false); }, [cat.imageUrl]);

  if (!cat.imageUrl || failed) {
    return (
      <View style={[style, styles.placeholder]} accessible accessibilityLabel={`Foto de ${cat.name} indisponível`}>
        <Ionicons name="paw-outline" size={iconSize} color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: cat.imageUrl }}
      style={style}
      onError={() => setFailed(true)}
      accessibilityLabel={`Foto de ${cat.name}`}
    />
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  placeholder: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
