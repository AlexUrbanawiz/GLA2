// name, quantity, price

export class Ingredient {
  constructor(item, quantity, price) {
    this.item = item;
    this.quantity = quantity;
    this.price = price;
  }
  get_name() {
    return this.item;
  }
  get_quantity() {
    return this.quantity;
  }
  get_price() {
    return this.price;
  }
}
