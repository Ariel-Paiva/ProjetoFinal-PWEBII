import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
runApp(const BallonDorApp());
}

class BallonDorApp extends StatelessWidget {
const BallonDorApp({super.key});

@override
Widget build(BuildContext context) {
return MaterialApp(
title: "Ballon d'Or 2025",
theme: ThemeData(
colorScheme: ColorScheme.fromSeed(seedColor: Colors.amber),
useMaterial3: true,
),
home: const BallonDorPage(),
);
}
}

class BallonDorPage extends StatefulWidget {
const BallonDorPage({super.key});

@override
State createState() => _BallonDorPageState();
}

class _BallonDorPageState extends State {
late final WebViewController _controller;

@override
void initState() {
super.initState();
_controller = WebViewController()
..setJavaScriptMode(JavaScriptMode.unrestricted)
..loadRequest(
Uri.parse("https://www.francefootball.fr/ballon-d-or/"),
);
}

@override
Widget build(BuildContext context) {
return Scaffold(
appBar: AppBar(
title: const Text("Ballon d'Or 2025"),
backgroundColor: Colors.amber,
),
body: WebViewWidget(controller: _controller),
);
}
}