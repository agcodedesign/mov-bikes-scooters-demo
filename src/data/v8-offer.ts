const model = 'V8 Pro S com duas baterias';
const price = 9200;
const discount = 0.1;
const installments = 10;
const brl = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const v8Offer = {
  model,
  price: brl(price),
  installments,
  installment: brl(price / installments),
  cash: brl(price * (1 - discount)),
  discountPercent: discount * 100,
  message: `Olá! Quero comprar a ${model}, anunciada por ${brl(price)} no cartão em até ${installments}x ou ${brl(price * (1 - discount))} no Pix ou dinheiro. Podem confirmar a disponibilidade?`,
};
