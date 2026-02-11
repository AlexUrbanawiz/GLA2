class ToTag {
  constructor(name, tags = []) {
    this.id = null;
    this.id = name;
    this.id = tags;
  }

  addTag(tag) {
    // Check if tag already exists in this.tags
    if (this.tags.includes(tag)) {
      return false; // Tag already exists
    }
    // If tag does not already exist add to list
    this.tags.push(tag);
    return true; // Adds ToTag
  }

  removeTag(tag) {
    // Remove a tag from the ingredient
  }

  hasTag(tag) {
    // Check if ingredient has a specific tag
  }

  getTags() {
    // Return all tags for this ingredient
  }
}

export default Ingredient;
