// Agregação e Composição
import 'dart:convert';

class Dependente {
  late String _nome;

  Dependente(String nome) {
    this._nome = nome;
  }

  Map<String, dynamic> toJson() {
    return {
      'nome': _nome,
    };
  }
}

class Funcionario {
  late String _nome;
  late List<Dependente> _dependentes;

  Funcionario(String nome, List<Dependente> dependentes) {
    this._nome = nome;
    this._dependentes = dependentes;
  }

  Map<String, dynamic> toJson() {
    return {
      'nome': _nome,
      'dependentes': _dependentes.map((d) => d.toJson()).toList(),
    };
  }
}

class EquipeProjeto {
  late String _nomeProjeto;
  late List<Funcionario> _funcionarios;

  EquipeProjeto(String nomeprojeto, List<Funcionario> funcionarios) {
    _nomeProjeto = nomeprojeto;
    _funcionarios = funcionarios;
  }

  Map<String, dynamic> toJson() {
    return {
      'nomeProjeto': _nomeProjeto,
      'funcionarios': _funcionarios.map((f) => f.toJson()).toList(),
    };
  }
}

void main() {
  // 1. Criar vários objetos Dependentes
  var dep1 = Dependente("Lucas");
  var dep2 = Dependente("Maria");
  var dep3 = Dependente("João");
  var dep4 = Dependente("Ana");

  // 2. Criar vários objetos Funcionário com seus dependentes
  var func1 = Funcionario("Carlos", [dep1, dep2]);
  var func2 = Funcionario("Fernanda", [dep3]);
  var func3 = Funcionario("Roberto", [dep4]);

  // 3. Criar lista de Funcionários
  var funcionarios = [func1, func2, func3];

  // 4. Criar EquipeProjeto
  var equipe = EquipeProjeto("Sistema de Vendas", funcionarios);

  // 5. Printar no formato JSON
  var jsonString = jsonEncode(equipe.toJson());
  print(jsonString);
}
