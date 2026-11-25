library goreecloud_ui_expressive;

import 'package:flutter/material.dart';
import 'src/generated/gc_ui_palettes.g.dart';

/// Accent identity remains a product/user choice, never a forced global hue.
enum GoreeAccent { iris, lagoon, ember, moss }

@immutable
class GoreeCloudPalette {
  final Map<String, int> _roles;
  const GoreeCloudPalette._(this._roles);

  static GoreeCloudPalette forAppearance({
    required Brightness brightness,
    GoreeAccent accent = GoreeAccent.iris,
  }) {
    final mode = brightness == Brightness.dark ? 'dark' : 'light';
    final roles = generatedGoreePalettes[accent.name + '/' + mode];
    if (roles == null) throw StateError('Unknown GoreeCloud UI palette');
    return GoreeCloudPalette._(roles);
  }

  Color role(String name) {
    final value = _roles[name];
    if (value == null) throw ArgumentError.value(name, 'name', 'Unknown GC UI role');
    return Color(value);
  }

  Color get canvas => role('canvas');
  Color get surface => role('surface');
  Color get tonalSurface => role('surface-tonal');
  Color get lensSolid => role('lens-solid');
  Color get text => role('text');
  Color get textSoft => role('text-soft');
  Color get brand => role('brand');
  Color get onBrand => role('on-brand');
  Color get brandContainer => role('brand-container');
  Color get onBrandContainer => role('on-brand-container');
  Color get outline => role('outline');
  Color get outlineSoft => role('outline-soft');
  Color get negative => role('negative');
  Color get onNegative => role('on-negative');
}

/// Flutter's supported Material 3 styled with canonical GC UI tokens.
/// This is an expressive-equivalent baseline, NOT full Jetpack Compose
/// Material 3 Expressive component/motion/shape-morph parity.
abstract final class GoreeCloudFlutterTheme {
  static const double radiusChip = 12;
  static const double radiusButton = 18;
  static const double radiusSurface = 26;
  static const double radiusDialog = 36;

  static ThemeData build({
    required Brightness brightness,
    GoreeAccent accent = GoreeAccent.iris,
  }) {
    final c = GoreeCloudPalette.forAppearance(brightness: brightness, accent: accent);
    final scheme = ColorScheme.fromSeed(
      seedColor: c.brand,
      brightness: brightness,
    ).copyWith(
      primary: c.brand,
      onPrimary: c.onBrand,
      primaryContainer: c.brandContainer,
      onPrimaryContainer: c.onBrandContainer,
      secondary: c.brand,
      onSecondary: c.onBrand,
      secondaryContainer: c.brandContainer,
      onSecondaryContainer: c.onBrandContainer,
      tertiary: c.brand,
      onTertiary: c.onBrand,
      surface: c.surface,
      onSurface: c.text,
      surfaceContainerHighest: c.tonalSurface,
      outline: c.outline,
      outlineVariant: c.outlineSoft,
      error: c.negative,
      onError: c.onNegative,
      surfaceTint: c.brand,
    );
    const buttonShape = RoundedRectangleBorder(
      borderRadius: BorderRadius.all(Radius.circular(radiusButton)),
    );
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: c.canvas,
      cardTheme: CardTheme(
        elevation: 0,
        color: c.surface,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(radiusSurface)),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: buttonShape,
          minimumSize: const Size(44, 44),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: buttonShape,
          minimumSize: const Size(44, 44),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(radiusChip)),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: c.lensSolid,
        elevation: 3,
        height: 72,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        indicatorShape: const StadiumBorder(),
      ),
      dialogTheme: const DialogTheme(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(radiusDialog)),
        ),
      ),
    );
  }
}

/// Motion policy is consumer-owned; read Android/OS preference before animating.
abstract final class GoreeCloudMotion {
  static bool reduced(BuildContext context) => MediaQuery.disableAnimationsOf(context);
}

/// Compact, rounded and inset, for 2 to 5 genuine navigation destinations.
/// Put this in Scaffold.bottomNavigationBar so content reserves its height.
class GoreeCloudFloatingNavigation extends StatelessWidget {
  final List<NavigationDestination> destinations;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;

  const GoreeCloudFloatingNavigation({
    super.key,
    required this.destinations,
    required this.selectedIndex,
    required this.onDestinationSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (destinations.length < 2 || destinations.length > 5) {
      throw ArgumentError.value(destinations.length, 'destinations',
          'Use 2–5 genuine compact destinations');
    }
    if (selectedIndex < 0 || selectedIndex >= destinations.length) {
      throw RangeError.index(selectedIndex, destinations);
    }
    return SafeArea(
      top: false,
      minimum: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Material(
        elevation: 3,
        color: Theme.of(context).colorScheme.surface,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(GoreeCloudFlutterTheme.radiusSurface),
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: NavigationBar(
          selectedIndex: selectedIndex,
          backgroundColor: Colors.transparent,
          elevation: 0,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          onDestinationSelected: (index) {
            if (index != selectedIndex) onDestinationSelected(index);
          },
          destinations: destinations,
        ),
      ),
    );
  }
}
