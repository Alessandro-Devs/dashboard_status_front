import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(process.cwd(), "src", "components");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function createUseClientStatement() {
  return ts.factory.createExpressionStatement(ts.factory.createStringLiteral("use client"));
}

function isUseClientStatement(statement) {
  return (
    ts.isExpressionStatement(statement) &&
    ts.isStringLiteral(statement.expression) &&
    statement.expression.text === "use client"
  );
}

function normalizeFile(filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const hasUseClient = sourceFile.statements.some(isUseClientStatement);
  const statements = hasUseClient
    ? sourceFile.statements
    : ts.factory.createNodeArray([createUseClientStatement(), ...sourceFile.statements]);

  const updatedSourceFile = ts.factory.updateSourceFile(sourceFile, statements);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const printed = printer.printFile(updatedSourceFile).replace(/\r\n/g, "\n");
  const nextText = printed.endsWith("\n") ? printed : `${printed}\n`;

  if (nextText !== sourceText) {
    fs.writeFileSync(filePath, nextText, "utf8");
  }
}

for (const filePath of walk(rootDir)) {
  normalizeFile(filePath);
}
