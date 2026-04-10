import 'package:flutter/material.dart';
import 'floating_notification.dart';

void main() {
  runApp(const FloatingNotificationDemoApp());
}

class FloatingNotificationDemoApp extends StatelessWidget {
  const FloatingNotificationDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Notification flottante',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4)),
        useMaterial3: true,
      ),
      home: const DemoHome(),
    );
  }
}

class DemoHome extends StatelessWidget {
  const DemoHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Démo notification')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FilledButton.icon(
              onPressed: () {
                showFloatingTopNotification(
                  context,
                  message: 'Votre message personnalisé apparaît ici pendant 3 secondes.',
                );
              },
              icon: const Icon(Icons.notifications_outlined),
              label: const Text('Afficher la notification'),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () {
                showFloatingTopNotification(
                  context,
                  message: 'Couleurs personnalisées (vert → bleu)',
                  startColor: const Color(0xFF0D9488),
                  endColor: const Color(0xFF2563EB),
                );
              },
              child: const Text('Variante colorée'),
            ),
          ],
        ),
      ),
    );
  }
}
