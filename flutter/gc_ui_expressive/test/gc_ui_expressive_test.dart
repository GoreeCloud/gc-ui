import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goreecloud_ui_expressive/goreecloud_ui_expressive.dart';

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
}
