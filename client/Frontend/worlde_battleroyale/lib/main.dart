import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Align(
            alignment: Alignment.center,
            child: Text('Home Page Demo', 
            style: TextStyle(fontSize: 50,fontWeight: FontWeight.bold, 
            ),
            ),
          )
        ),
      ),
    );
  }
}