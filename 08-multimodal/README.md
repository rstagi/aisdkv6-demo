# 08 - Multimodal

## What this demonstrates

- Image upload in chat interface
- Multimodal AI with Gemini vision capabilities
- Attachments in `sendMessage({ attachments })`
- Image preview before sending
- Same API handles text and images seamlessly

## Prerequisites

```bash
docker compose up -d  # from root
cd ../02-add-knowledge && pnpm seed  # need knowledge base
```

## Run

```bash
ln -sf ../.env .env
pnpm install
pnpm dev  # Opens at http://localhost:3000
```

## Key code patterns

### Image upload with FileReader

```tsx
const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file?.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = () => {
    setPendingFiles([{
      type: "file",
      url: reader.result as string,  // base64 data URL
      mediaType: file.type,
    }]);
  };
  reader.readAsDataURL(file);
};
```

### Sending message with files

```tsx
sendMessage({
  text: input || "What's in this image?",
  files: pendingFiles.length > 0 ? pendingFiles : undefined,
});
```

### Rendering images in messages

```tsx
{message.parts?.map((part, i) => {
  if (part.type === "file") {
    const url = "url" in part ? part.url : null;
    const mediaType = "mediaType" in part ? part.mediaType : null;
    if (url && mediaType?.startsWith("image/")) {
      return <img src={url} alt="Uploaded" />;
    }
  }
})}
```

## Try these scenarios

1. Upload a photo and ask "What's in this image?"
2. Upload a screenshot of code and ask "Explain this code"
3. Upload a chart and ask "What trends do you see?"
4. Upload multiple screenshots and compare them
5. Mix image questions with tool usage (e.g., upload weather app screenshot, then ask for actual weather)

## Expected behavior

1. Click the image icon to select a file
2. Preview appears above the input field
3. Type a question or leave empty (defaults to "What's in this image?")
4. Click Send
5. Image appears in your message bubble
6. AI analyzes the image and responds

## File size note

Images are sent as base64 data URLs. For production:
- Consider server-side upload to cloud storage
- Implement file size limits
- Compress images before sending

## Speaker notes

- "Gemini is multimodal — it can see images natively"
- "We just add an attachment to the sendMessage call"
- "The API is the same whether you send text, images, or both"
- "This opens up so many use cases: document analysis, chart interpretation, UI review..."
- "Watch how the model describes what it sees"
- Transition: "Now let's put it all together in a polished final demo..."
