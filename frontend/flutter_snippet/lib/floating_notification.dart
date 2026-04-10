import 'package:flutter/material.dart';

/// Affiche une notification en haut de l’écran, [duration] par défaut 3 secondes.
/// Style arrondi et dégradé coloré ; message entièrement personnalisable.
void showFloatingTopNotification(
  BuildContext context, {
  required String message,
  Duration duration = const Duration(seconds: 3),
  Color? startColor,
  Color? endColor,
}) {
  final overlay = Overlay.maybeOf(context);
  if (overlay == null) return;

  final topPadding = MediaQuery.of(context).padding.top;
  final cs = Theme.of(context).colorScheme;

  late OverlayEntry entry;
  entry = OverlayEntry(
    builder: (ctx) => _TopNotificationOverlay(
      topPadding: topPadding,
      message: message,
      duration: duration,
      startColor: startColor ?? cs.primary,
      endColor: endColor ?? cs.tertiary,
      onRemove: () {
        entry.remove();
      },
    ),
  );

  overlay.insert(entry);
}

class _TopNotificationOverlay extends StatefulWidget {
  const _TopNotificationOverlay({
    required this.topPadding,
    required this.message,
    required this.duration,
    required this.startColor,
    required this.endColor,
    required this.onRemove,
  });

  final double topPadding;
  final String message;
  final Duration duration;
  final Color startColor;
  final Color endColor;
  final VoidCallback onRemove;

  @override
  State<_TopNotificationOverlay> createState() => _TopNotificationOverlayState();
}

class _TopNotificationOverlayState extends State<_TopNotificationOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _slide;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    _slide = Tween<Offset>(begin: const Offset(0, -1), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.forward();

    Future<void>.delayed(widget.duration, () async {
      if (!mounted) return;
      await _controller.reverse();
      widget.onRemove();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: widget.topPadding + 12,
          left: 16,
          right: 16,
          child: SlideTransition(
            position: _slide,
            child: FadeTransition(
              opacity: _fade,
              child: Material(
                color: Colors.transparent,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      colors: [
                        widget.startColor,
                        widget.endColor,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: widget.startColor.withOpacity(0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    child: Row(
                      children: [
                        Icon(Icons.notifications_active_rounded, color: Colors.white.withOpacity(0.95), size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            widget.message,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              height: 1.25,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
