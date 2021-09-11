const { model: GameNote } = require("./gameNoteModel");
const { model: User } = require("../../users/userModel");

exports.createNote = async newNote => {
  try {
    const note = await new GameNote(newNote);
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
          gameNotes: {
            _id: noteId
          }
        }
      }
    );
  } catch (e) {
    throw e;
  }
};

exports.unlinkGameNote = async (userId, noteId) => {
  try {
    return await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { gameNotes: { _id: noteId } } }
    );
  } catch (e) {
    throw e;
  }
};

exports.deleteNote = async noteId => {
  try {
    return await GameNote.findByIdAndDelete({ _id: noteId });
  } catch (e) {
    throw e;
  }
};

exports.getNoteById = async noteId => {
  try {
    return await GameNote.findById({ _id: noteId }).populate({
      path: "filter"
    });
  } catch (e) {
    throw e;
  }
};

exports.updateNote = async (id, note, filter) => {
  try {
    return await GameNote.findByIdAndUpdate(
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
