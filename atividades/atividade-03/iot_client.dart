import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'dart:math';

Future<void> startIoTClient() async {
  try {
    final socket = await Socket.connect(InternetAddress.loopbackIPv4, 4040);
    print('Conectado ao servidor');

    final random = Random();

    // Envia uma temperatura a cada 10 segundos
    Timer.periodic(Duration(seconds: 10), (timer) {
      final temperature = (20 + random.nextDouble() * 15).toStringAsFixed(2);
      final data = utf8.encode(temperature);
      socket.add(data);
      print('Temperatura enviada: $temperature °C');
    });
  } catch (e) {
    print('Erro ao conectar ao servidor: $e');
  }
}

void main() {
  startIoTClient();
}
