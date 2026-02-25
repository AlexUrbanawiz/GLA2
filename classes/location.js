export default class Location {
    constructor(name, ingList = []) {
        this.name = name
        this.ingredientsList = ingList
    }

    addIngredient(ingredient) {
        this.ingredientsList.push(ingredient)
    }
}