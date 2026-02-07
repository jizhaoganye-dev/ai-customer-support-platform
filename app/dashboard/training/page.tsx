'use client'

import { useState, useMemo } from 'react'
import { TRAINING_SCENARIOS, type TrainingScenario } from '@/lib/mock-data'

type Answer = 'harassment' | 'not_harassment' | null

interface Result {
  scenarioId: string
  answer: Answer
  correct: boolean
}

export default function TrainingPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [difficulty, setDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [isComplete, setIsComplete] = useState(false)

  const scenarios = useMemo(() => {
    if (difficulty === 'all') return TRAINING_SCENARIOS
    return TRAINING_SCENARIOS.filter(s => s.difficulty === difficulty)
  }, [difficulty])

  const currentScenario = scenarios[currentIndex] as TrainingScenario | undefined

  const handleAnswer = (answer: Answer) => {
    if (showExplanation || !currentScenario) return
    setSelectedAnswer(answer)
    setShowExplanation(true)

    const correct = answer === (currentScenario.isHarassment ? 'harassment' : 'not_harassment')
    setResults(prev => [...prev, { scenarioId: currentScenario.id, answer, correct }])
  }

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setIsComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setResults([])
    setIsComplete(false)
  }

  const correctCount = results.filter(r => r.correct).length
  const accuracy = results.length > 0 ? Math.round(correctCount / results.length * 100) : 0

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${accuracy >= 80 ? 'bg-emerald-100' : accuracy >= 60 ? 'bg-amber-100' : 'bg-red-100'}`}>
            <span className={`text-3xl font-bold ${accuracy >= 80 ? 'text-emerald-700' : accuracy >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
              {accuracy}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">研修完了</h2>
          <p className="text-slate-600 mb-6">
            {scenarios.length}問中 {correctCount}問正解（正答率 {accuracy}%）
          </p>

          {accuracy >= 80 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-emerald-800 font-medium">優秀な結果です。カスハラ判定の知識が十分にあります。</p>
            </div>
          ) : accuracy >= 60 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-medium">基本的な判定はできていますが、一部見落としがあります。再度研修を受けることを推奨します。</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">カスハラ判定の理解を深める必要があります。もう一度研修を受けてください。</p>
            </div>
          )}

          {/* Results Breakdown */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">回答一覧</h3>
            <div className="space-y-2">
              {results.map((result, i) => {
                const scenario = scenarios[i]
                return (
                  <div key={result.scenarioId} className={`flex items-center gap-3 p-3 rounded-lg ${result.correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <span className={`text-lg ${result.correct ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.correct ? '○' : '×'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{scenario.customerMessage}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${scenario.isHarassment ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {scenario.isHarassment ? 'ハラスメント' : '通常'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={handleRestart}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition">
            もう一度受ける
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">カスタマーハラスメント対応力を実践的なシナリオで強化</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value as typeof difficulty); handleRestart() }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="all">全レベル</option>
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">進捗: {currentIndex + 1} / {scenarios.length}</span>
          <span className="text-slate-600">正答率: {accuracy}% ({correctCount}/{results.length})</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-brand-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }} />
        </div>
      </div>

      {/* Scenario Card */}
      {currentScenario && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                currentScenario.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-700' :
                currentScenario.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              }`}>
                {currentScenario.difficulty === 'beginner' ? '初級' : currentScenario.difficulty === 'intermediate' ? '中級' : '上級'}
              </span>
              <span className="text-xs text-slate-400">シナリオ #{currentIndex + 1}</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <p className="text-xs text-slate-500 mb-2 font-medium">お客様からのメッセージ:</p>
              <p className="text-slate-900 text-lg leading-relaxed">
                &ldquo;{currentScenario.customerMessage}&rdquo;
              </p>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm font-medium text-slate-700 mb-4">このメッセージはカスタマーハラスメントに該当しますか？</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleAnswer('harassment')}
                disabled={showExplanation}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  showExplanation && selectedAnswer === 'harassment'
                    ? currentScenario.isHarassment ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                    : selectedAnswer === 'harassment' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } disabled:cursor-not-allowed`}
              >
                <span className="text-2xl block mb-1">⚠️</span>
                <span className="font-medium text-slate-900">ハラスメントである</span>
              </button>
              <button
                onClick={() => handleAnswer('not_harassment')}
                disabled={showExplanation}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  showExplanation && selectedAnswer === 'not_harassment'
                    ? !currentScenario.isHarassment ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                    : selectedAnswer === 'not_harassment' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } disabled:cursor-not-allowed`}
              >
                <span className="text-2xl block mb-1">✓</span>
                <span className="font-medium text-slate-900">ハラスメントではない</span>
              </button>
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="animate-slide-up space-y-4">
                <div className={`p-4 rounded-lg border ${
                  results[results.length - 1]?.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`font-semibold ${results[results.length - 1]?.correct ? 'text-emerald-800' : 'text-red-800'}`}>
                    {results[results.length - 1]?.correct ? '正解です！' : '不正解です。'}
                  </p>
                  <p className="text-sm text-slate-700 mt-2">{currentScenario.explanation}</p>
                </div>

                {currentScenario.isHarassment && currentScenario.severity !== 'none' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-1">深刻度: {
                      currentScenario.severity === 'critical' ? '緊急' :
                      currentScenario.severity === 'high' ? '高' :
                      currentScenario.severity === 'medium' ? '中' : '低'
                    }</p>
                    {currentScenario.keywords.length > 0 && (
                      <p className="text-xs text-amber-700">検出キーワード: {currentScenario.keywords.join(', ')}</p>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">推奨対応:</p>
                  <p className="text-sm text-blue-700">{currentScenario.recommendedResponse}</p>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleNext}
                    className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition">
                    {currentIndex < scenarios.length - 1 ? '次のシナリオ →' : '結果を見る'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
