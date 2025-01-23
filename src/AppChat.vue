<script setup lang="ts">
import { useChat } from './chat-system'
import { ref, onMounted, nextTick, computed } from 'vue'
import { marked } from 'marked'

const { messages, options, next, shouldShowOption } = useChat()
const displayedText = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const filteredOptions = computed(() => {
  return Object.fromEntries(Object.entries(options.value).filter(([key]) => shouldShowOption(key)))
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const typeMessage = async (text: string) => {
  isTyping.value = true
  displayedText.value = ''

  for (const char of text) {
    displayedText.value += char
    await new Promise((resolve) => setTimeout(resolve, 30))
    await scrollToBottom()
  }

  isTyping.value = false
}

const handleNext = async (key: string) => {
  next(key)
  if (messages.value[messages.value.length - 1].type === 'system') {
    typeMessage(messages.value[messages.value.length - 1].text)
  }
  await scrollToBottom()
}

const renderMarkdown = (text: string) => {
  return marked(text)
}

onMounted(() => {
  typeMessage(messages.value[0].text)
})
</script>

<template>
  <div class="app-chat">
    <div ref="messagesContainer" class="app-chat__messages">
      <div class="app-chat__message-wrapper" v-for="(message, index) in messages" :key="index">
        <svg
          v-if="message.type === 'system'"
          class="app-chat__message-icon"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.96-7 10.19-3.87-1.23-7-5.52-7-10.19V6.3l7-3.12zm-2 4.82L8.59 9.41 7.5 10.5l2.5 2.5 6-6L14.59 5.59 10 10z"
            fill="#2B5278"
          />
          <path
            d="M11.99 2L4 6v5c0 4.52 2.98 8.69 7 9.93 4.02-1.24 7-5.41 7-9.93V6l-7.99-4zM12 19.93C8.61 18.9 6 15.44 6 11V7.4l6-3.2 6 3.2V11c0 4.44-2.61 7.9-6 8.93z"
            fill="#90CAF9"
          />
          <path
            d="M12 2L4 6v5c0 4.52 2.98 8.69 7 9.93 4.02-1.24 7-5.41 7-9.93V6l-7-4zm5 9c0 3.44-2.61 6.9-6 7.93C7.61 17.9 5 14.44 5 11V7.4l7-3.73 7 3.73V11z"
            stroke="#1565C0"
            strokeWidth="0.5"
          />
        </svg>
        <div
          class="app-chat__message"
          :class="{
            'app-chat__message--user': message.type === 'user',
            'app-chat__message--system': message.type === 'system',
          }"
        >
          <template v-if="message.type === 'user'">
            <div v-html="renderMarkdown(message.text)"></div>
          </template>
          <template v-else>
            <div
              v-html="
                renderMarkdown(
                  index === messages.length - 1 && message.type === 'system'
                    ? displayedText
                    : message.text,
                )
              "
            ></div>
          </template>
        </div>
      </div>
    </div>
    <div class="app-chat__options">
      <button
        class="app-chat__button"
        v-for="(option, key) in filteredOptions"
        :key="key"
        @click="handleNext(String(key))"
        :disabled="isTyping"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-chat__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.app-chat {
  max-width: 600px;
  height: 500px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family:
    'Lato',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: flex;
  flex-direction: column;
}

.app-chat__messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 8px;
}

.app-chat__message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding-right: 8px;
}

.app-chat__message-icon {
  margin-top: 8px;
}

.app-chat__message {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: 0.2px;
}

.app-chat__message :deep(p) {
  margin: 0;
}

.app-chat__message :deep(ul),
.app-chat__message :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.app-chat__message--system {
  background: #f1f3f5;
  margin-right: auto;
  color: #2b3f5c;
}

.app-chat__message--user {
  background: #0d4cd3;
  color: white;
  margin-left: auto;
}

.app-chat__button {
  background: #fff;
  border: 1px solid #0d4cd3;
  color: #0d4cd3;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
}

.app-chat__button:hover:not(:disabled) {
  background: #0d4cd3;
  color: #fff;
}

.app-chat__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
