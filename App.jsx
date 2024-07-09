import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
//MainContainer = the outside box for the app(outer) 
//ChatContainer = the outside box that holds all the messages(inner)
//MessageList = the list of all messages
//MessageInput = where to type all the message to send to chatGPT
//placeHolder = Temporary text till the user puts in their input

const API_KEY = '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';

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! I'm ChatGPT",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };
    const newMessages = [...messages, newMessage]; // all the new messages and the new one
    // update our message state
    setMessages(newMessages);
    // Typing indicator
    setTyping(true);
    // Process message to ChatGPT (send it over and see the response)
    await processMessagetoChatGpt(newMessages);
  };

  async function processMessagetoChatGpt(chatMessages) {
    // chatMessages {sender: "user" or "ChatGPT", message: "the message content here"}
    // apiMessages { role: "user" or "assistant", content: "the message content here"}

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // role: "user" -> a message from the user. "assistant" -> response from ChatGPT
    // "system" -> generally one initial message defining HOW we want ChatGPT to talk
    const systemMessage = {
      role: "system",
      content: "Explain all content like I'm 10 years old"
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages // [message1, message2, message3]
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }]
      );
      setTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}>
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
