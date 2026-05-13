import 'dart:io';
import 'dart:convert';

Future<void> startServer() async {
  final server = await ServerSocket.bind(InternetAddress.loopbackIPv4, 4040);
  print('Servidor escutando em ${server.address.address}:${server.port}');

  await for (Socket client in server) {
    print('Cliente conectado: ${client.remoteAddress.address}:${client.remotePort}');
    client.listen(
      (data) {
        final message = utf8.decode(data);
        print('Temperatura recebida: $message °C');
      },
      onDone: () {
        print('Cliente desconectado.');
      },
      onError: (error) {
        print('Erro: $error');
      },
    );
  }
}

void main() {
  startServer();
}
