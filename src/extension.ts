import * as vscode from 'vscode';
import axios from "axios";

const handleOpenAPICall = async (inputValue: any) => {
  // Api Url
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  // Api Key
  const apiKey = "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";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const da = axios
    .post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You will be provided with a piece of code, and your task is to document it clearly.",
          },
          {
            role: "user",
            content: inputValue,
          },
        ],
      },
      { headers }
    )
    .then((response) => {
      console.log("Response:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    });
  return da;
};

export function activate(context: vscode.ExtensionContext) {

	console.log('Doc Ai" is now active!');

	  let docCreate = vscode.commands.registerCommand(
      "doc-ai.createDocumentation",
      async () => {
		try {
      // Show a progress indicator while fetching data from the API
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Preparing document for your code.....",
          cancellable: false,
        },
        async (progress, token) => {
          try {
            // Get the currently active text editor
            const editor = vscode.window.activeTextEditor;

            if (editor) {
              const document = editor.document;
              const entireText = document.getText();

              // Make a GET request to the API endpoint
              const response: any = await handleOpenAPICall(entireText);

              // Get the data from the API response
              const apiData = response.choices[0].message.content;

              editor.edit((editBuilder) => {
                const startPosition = new vscode.Position(0, 0);
                const endPosition = new vscode.Position(
                  editor.document.lineCount - 1,
                  editor.document.lineAt(
                    editor.document.lineCount - 1
                  ).text.length
                );
                const range = new vscode.Range(startPosition, endPosition);

                editBuilder.replace(range, apiData);
              });

              vscode.window.showInformationMessage(
                "Code Documented successfully!"
              );
            } else {
              vscode.window.showInformationMessage(
                "No active text editor found."
              );
            }
          } catch (error) {
            console.error("Error fetching data from API:", error);
            vscode.window.showErrorMessage("Error preparing documentation!");
          } finally {
          }
        }
      );
    } catch (error) {
      console.error("Error fetching data from API:", error);
      vscode.window.showErrorMessage(
        "Error fetching data from API. Please check the console for details."
      );
    }
      }
    );

    context.subscriptions.push(docCreate);
}

// This method is called when your extension is deactivated
export function deactivate() {}
