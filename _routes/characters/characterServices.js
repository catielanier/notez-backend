const { model: Character } = require("./characterModel");

exports.createCharacter = async characterData => {
  try {
    const character = new Character(characterData);
    return await character.save();
  } catch (e) {
    throw e;
  }
};

exports.getAllCharacters = async () => {
  try {
    const characters = await Character.find({});
    if (characters) {
      return characters;
    }
  } catch (e) {
    throw e;
  }
};

exports.updateCharacter = async (
  id,
  name,
  name_ja,
  name_ko,
  name_cn,
  name_tw,
  name_hk
) => {
  try {
    return await Character.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          name_ja,
          name_ko,
          "name_zh-cn": name_cn,
          "name_zh-tw": name_tw,
          "name_zh-hk": name_hk
        }
      }
    );
  } catch (e) {
    throw e;
  }
};
