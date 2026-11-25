import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goreecloud_ui_expressive/goreecloud_ui_expressive.dart';

/// WCAG 2 contrast ratio for opaque foreground and background tokens.
double contrastRatio(Color foreground, Color background) {
  assert(foreground.alpha == 255 && background.alpha == 255);
  final a = foreground.computeLuminance();
  final b = background.computeLuminance();
  final lighter = a >= b ? a : b;
  final darker = a >= b ? b : a;
  return (lighter + 0.05) / (darker + 0.05);
}

void main() {
  for (final accent in GoreeAccent.values) {
    for (final brightness in Brightness.values) {
      test('canonical colors for $accent $brightness', () {
        final palette = GoreeCloudPalette.forAppearance(
            brightness: brightness, accent: accent);
        final theme = GoreeCloudFlutterTheme.build(
            brightness: brightness, accent: accent);
        expect(theme.useMaterial3, isTrue);
        expect(theme.scaffoldBackgroundColor, palette.canvas);
        expect(theme.colorScheme.primary, palette.brand);
        expect(theme.colorScheme.onPrimary, palette.onBrand);
        expect(theme.colorScheme.surface, palette.surface);
        expect(theme.colorScheme.error, palette.negative);
        expect(theme.colorScheme.outline, palette.outline);
      });
    }
  }

  testWidgets('floating navigation ignores repeats and reports genuine route changes',
      (tester) async {
    final selected = <int>[];
    await tester.pumpWidget(MaterialApp(
      theme: GoreeCloudFlutterTheme.build(brightness: Brightness.light),
      home: Scaffold(
        bottomNavigationBar: GoreeCloudFloatingNavigation(
          selectedIndex: 0,
          onDestinationSelected: selected.add,
          destinations: const [
            NavigationDestination(icon: Icon(Icons.search), label: 'Explore'),
            NavigationDestination(icon: Icon(Icons.favorite), label: 'Saved'),
          ],
        ),
      ),
    ));
    await tester.tap(find.text('Explore'));
    await tester.pump();
    expect(selected, isEmpty);
    await tester.tap(find.text('Saved'));
    await tester.pump();
    expect(selected, [1]);
  });

  testWidgets('fake single-route navigation is rejected', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        bottomNavigationBar: GoreeCloudFloatingNavigation(
          selectedIndex: 0,
          onDestinationSelected: (_) {},
          destinations: const [
            NavigationDestination(icon: Icon(Icons.search), label: 'Only'),
          ],
        ),
      ),
    ));
    expect(tester.takeException(), isArgumentError);
  });

  for (final accent in GoreeAccent.values) {
    for (final brightness in Brightness.values) {
      test('semantic text contrast is at least WCAG 2 AA for $accent $brightness', () {
        final p = GoreeCloudPalette.forAppearance(
          brightness: brightness, accent: accent,
        );
        final pairs = <(String, Color, Color)>[
          ('text/surface', p.text, p.surface),
          ('text/canvas', p.text, p.canvas),
          ('text-soft/surface', p.textSoft, p.surface),
          ('text-soft/canvas', p.textSoft, p.canvas),
          ('on-brand/brand', p.onBrand, p.brand),
          ('on-brand-container/brand-container',
              p.onBrandContainer, p.brandContainer),
          ('on-negative/negative', p.onNegative, p.negative),
        ];
        for (final (name, foreground, background) in pairs) {
          expect(contrastRatio(foreground, background), greaterThanOrEqualTo(4.5),
              reason: '$accent $brightness: $name');
        }
      });
    }
  }

  testWidgets('system disable-animations preference is read without telemetry',
      (tester) async {
    bool? observed;
    Future<void> render(bool disabled) async {
      await tester.pumpWidget(MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(disableAnimations: disabled),
          child: Builder(builder: (context) {
            observed = GoreeCloudMotion.reduced(context);
            return const SizedBox.shrink();
          }),
        ),
      ));
    }
    await render(true);
    expect(observed, isTrue);
    await render(false);
    expect(observed, isFalse);
  });

  testWidgets('floating navigation reserves insets and avoids screen-edge strips',
      (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        bottomNavigationBar: GoreeCloudFloatingNavigation(
          selectedIndex: 0,
          onDestinationSelected: (_) {},
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.settings), label: 'Settings'),
          ],
        ),
      ),
    ));
    final inset = tester.widget<SafeArea>(find.descendant(
      of: find.byType(GoreeCloudFloatingNavigation),
      matching: find.byType(SafeArea),
    ));
    expect(inset.top, isFalse);
    expect(inset.minimum, const EdgeInsets.fromLTRB(16, 8, 16, 8));
  });
}
