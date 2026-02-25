class ToTag {
  constructor(name, tags = []) {
    this.id = null;
    this.name = name;
    this.tags = tags;
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
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
      return true;
    }
    return false; // Tag did not exist
  }

  hasTag(tag) {
    // Check if ingredient has a specific tag
    return this.tags.includes(tag);
  }

  getTags() {
    // Return all tags for this ingredient
    return this.tags;
  }
}

export default ToTag;
