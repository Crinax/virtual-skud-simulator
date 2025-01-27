<script setup lang="ts">
import { useChat } from './chat-system'
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'

const { messages, options, next, testQuestions, isStateTest } = useChat()
const displayedText = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const currentQuestionIndex = ref(0)
const userAnswers = ref<string[]>([])
const isResultsView = ref(false)
const testResults = ref<{ question: string; userAnswer: string; correct: boolean }[]>([])

const isAtBottom = ref(true)

const checkScrollPosition = () => {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    isAtBottom.value = scrollHeight - (scrollTop + clientHeight) < 5
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value && isAtBottom.value) {
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
  isResultsView.value = false
  if (testQuestions.value.length > 0 && isStateTest(key)) {
    // Обработка теста
    const question = testQuestions.value[currentQuestionIndex.value]
    userAnswers.value.push(key)
    const isCorrect = question.answers.find((answer) => answer.id === key)?.isCorrect

    testResults.value.push({
      question: question.question,
      userAnswer: key,
      correct: isCorrect ?? false,
    })

    currentQuestionIndex.value++

    if (currentQuestionIndex.value < testQuestions.value.length) {
      // Показать следующий вопрос
      typeMessage(testQuestions.value[currentQuestionIndex.value].question)
    } else {
      // Завершить тест и показать результаты
      let markdownTable =
        'Тест завершен. Вот ваши результаты:\n\n| Вопрос | Результат |\n| --- | --- |\n'
      testResults.value.forEach((result) => {
        const emoji = result.correct ? '✔' : '✖' // Галочка без фона для правильного и неправильного ответов
        markdownTable += `| ${result.question} | ${emoji} |\n`
      })
      typeMessage(markdownTable)
      currentQuestionIndex.value = 0
      userAnswers.value = []
      isResultsView.value = true
    }
  } else {
    next(key)
    if (messages.value[messages.value.length - 1].type === 'system') {
      typeMessage(messages.value[messages.value.length - 1].text)
    }
    await scrollToBottom()
  }
}

const renderMarkdown = (text: string) => {
  return marked(text)
}

const answerQuestion = (answerId: string) => {
  handleNext(answerId)
}

onMounted(() => {
  typeMessage(messages.value[0].text)
})
</script>

<template>
  <div class="app-chat">
    <div ref="messagesContainer" class="app-chat__messages" @scroll="checkScrollPosition">
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
            <div
              class="app-chat__answer-buttons"
              v-if="
                testQuestions.length > 0 &&
                currentQuestionIndex < testQuestions.length &&
                message.type === 'system' &&
                index === messages.length - 1 &&
                !isResultsView
              "
            >
              <button
                class="app-chat__transparent-button"
                v-for="answer in testQuestions[currentQuestionIndex].answers"
                :key="answer.id"
                @click="answerQuestion(answer.id)"
                :disabled="isTyping"
              >
                {{ answer.text }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="app-chat__options">
      <button
        class="app-chat__button"
        v-for="(option, key) in options"
        :key="key"
        @click="handleNext(String(key))"
        :disabled="isTyping || testQuestions.length > 0 && !isResultsView"
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
  margin-top: auto;
}

.app-chat {
  width: 600px;
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

@media (max-width: 768px) {
  .app-chat {
    width: 100dvw;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    border-radius: 0;
    margin: 0;
    padding: 16px 16px 32px 16px;
    position: relative;
    box-shadow: none;
    max-width: none;
  }
  .app-chat__messages {
    padding-top: 16px;
    min-height: 60%;
    flex-grow: 1;
  }
  .app-chat__options {
    max-height: 30%;
    flex-grow: 0;
    flex-shrink: 0;
  }
}

.app-chat__messages {
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
  flex-shrink: 0;
}

.app-chat__message {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: 0.2px;
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-chat__message div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.app-chat__message--user {
  white-space: normal;
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
  margin-bottom: 4px;
  font-size: 18px;
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

.app-chat__question-container {
  margin-top: 10px;
  margin-bottom: 10px;
}

.app-chat__answer-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-chat__transparent-button {
  background: transparent;
  border: 1px solid #0d4cd3;
  color: #0d4cd3;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.app-chat__transparent-button:hover {
  background: rgba(13, 76, 211, 0.1);
}

:deep(table tr td:last-child) {
  text-align: center;
  vertical-align: top;
  border-radius: 4px;
}
:deep(table) {
  border-collapse: collapse;
}

:deep(tr) {
  border-bottom: 1px solid #c9c9c9;
}

:deep(td),
:deep(th) {
  border-bottom: 1px solid #c9c9c9;
}

:deep(td) {
  padding: 8px;
}
:deep(table tr:last-child) {
  border-bottom: none;
}
</style>
