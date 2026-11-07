import { test } from 'node:test';
import assert from 'node:assert';
import { validarEmail, validarSenha } from '../src/utils.js';

test('aceita e-mail válido', () => {
  assert.strictEqual(validarEmail('aluno@escola.com'), true);
});

test('rejeita e-mail inválido', () => {
  assert.strictEqual(validarEmail('aluno.escola'), false);
});

test('senha precisa ter 6+ caracteres', () => {
  assert.strictEqual(validarSenha('123'), false);
  assert.strictEqual(validarSenha('123456'), true);
});