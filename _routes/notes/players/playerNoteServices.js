const { model: PlayerNote } = require("./playerNoteModel");
const { model: User } = require("../../users/userModel");

exports.createNote = async newNote => {
  try {
    const note = await new PlayerNote(newNote);
    return await note.save();
  } catch (e) {
    throw e;
  }
};

exports.linkNoteToUser = async (userId, noteId) => {
  try {
    return await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          playerNotes: {
            _id: noteId
          }
        }
      }
    );
  } catch (e) {
    throw e;
  }
};

exports.getNoteById = async noteId => {
  try {
    return await PlayerNote.findById({ _id: noteId }).populate({
      path: "filter"
    });
  } catch (e) {
    throw e;
  }
};

exports.deleteNote = async noteId => {
  try {
    return await PlayerNote.findByIdAndDelete({ _id: noteId });
  } catch (e) {
    throw e;
  }
};

exports.updateNote = async (id, note, filter) => {
  try {
    return await PlayerNote.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          filter: {
            _id: filter
          },
          note
        }
      }
    );
  } catch (e) {
    throw e;
  }
};

exports.unlinkPlayerNote = async (userId, noteId) => {
  try {
    return await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { playerNotes: { _id: noteId } } }
    );
  } catch (e) {
    throw e;
  }
};
