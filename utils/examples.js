function displayExamples() {
  console.log("\n📖 Welcome to the Summarist CLI! Here's how to use it:");

  console.log("\n🔍 **1. Summarize Text:**");
  console.log("   - Type or paste text, and Summarist will summarize it. Example: 'Summarist helps simplify documents.'");

  console.log("\n📂 **2. Summarize a File:**");
  console.log("   - Provide a file path (PDF, DOCX, TXT). Example: './research_paper.pdf'");

  console.log("\n💾 **3. Save Output:**");
  console.log("   - Save your summary in TXT or PDF. Example: 'txt' or 'pdf'");

  console.log("\n💬 **4. Sentiment Analysis:**");
  console.log("   - Analyze tone. Example: 'Fantastic job!' returns 'Positive sentiment detected.'");

  console.log("\n🔑 **5. Extract Keywords:**");
  console.log("   - Extract keywords. Example: 'Summarist is a great tool.' returns 'Summarist, tool'");

  console.log("\n❓ **Need help?**");
  console.log("   - Type 'summarize --help' for instructions.");

  console.log("\n✨ Enjoy using Summarist!");
}

module.exports = { displayExamples };
