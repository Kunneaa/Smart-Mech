const Chapter2 = require("./ChapterFunction/chap2Function");
const Chapter3 = require("./ChapterFunction/chap3Function");
const Chapter4 = require("./ChapterFunction/chap4Function");
const Chapter5 = require("./ChapterFunction/chap5Function");

const chapterRegistry = {
  Chapter2,
  Chapter3,
  Chapter4,
  Chapter5,
};

class MachineCalculatorFactory {
  static getChapter(chapterId) {
    const ChapterClass = chapterRegistry[chapterId];

    if (!ChapterClass) {
      throw new Error(`Unsupported chapter id: ${chapterId}`);
    }

    return new ChapterClass();
  }
}

module.exports = MachineCalculatorFactory