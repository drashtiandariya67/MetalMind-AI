// MetalMind AI — Assistant Screen
// Chat interface for the rule-based AI

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePriceStore } from '@/store/priceStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { generateAssistantResponse, QUICK_ACTIONS, type ChatMessage } from '@/services/api/assistantService';
import { fetchHistoricalPrices } from '@/services/api/priceService';
import { generateAllPredictions } from '@/services/analysis/predictionEngine';
import { detectOpportunities } from '@/services/analysis/opportunityDetector';
import { generateIndicatorSnapshot } from '@/services/analysis/technicalAnalysis';
import type { Prediction } from '@/types/predictions';

export default function AssistantScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { market } = usePriceStore();
  const { calculateSummary } = usePortfolioStore();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'assistant',
    content: "Hi! I'm your MetalMind AI Assistant. I analyze market data, technical indicators, and price ratios offline to help you make better decisions.\n\nHow can I help you today?",
    timestamp: new Date().toISOString(),
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Context for AI
  const [predictions, setPredictions] = useState<{ gold?: Record<string, Prediction>; silver?: Record<string, Prediction> }>({});
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);

  // Load context data on mount
  useEffect(() => {
    async function loadContext() {
      if (!market) return;
      
      try {
        const [goldHistory, silverHistory] = await Promise.all([
          fetchHistoricalPrices('gold', 90),
          fetchHistoricalPrices('silver', 90),
        ]);

        const goldPred = generateAllPredictions('gold', goldHistory, market.gold.pricePerGramINR, market.ratio);
        const silverPred = generateAllPredictions('silver', silverHistory, market.silver.pricePerGramINR, market.ratio);
        setPredictions({ gold: goldPred, silver: silverPred });

        const goldIndicators = generateIndicatorSnapshot(
          goldHistory.map(d => d.close), goldHistory.map(d => d.high), goldHistory.map(d => d.low)
        );
        const goldOpps = detectOpportunities('gold', market.gold.pricePerGramINR, goldHistory, goldIndicators);
        
        const silverIndicators = generateIndicatorSnapshot(
          silverHistory.map(d => d.close), silverHistory.map(d => d.high), silverHistory.map(d => d.low)
        );
        const silverOpps = detectOpportunities('silver', market.silver.pricePerGramINR, silverHistory, silverIndicators);
        
        setOpportunities([...goldOpps, ...silverOpps]);

        const summary = calculateSummary(market.gold.pricePerGramINR, market.silver.pricePerGramINR);
        setPortfolioSummary(summary);
      } catch (err) {
        console.error('Failed to load AI context', err);
      }
    }
    loadContext();
  }, [market]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Generate response
    setTimeout(() => {
      const responseContent = generateAssistantResponse(text, {
        market,
        predictions,
        opportunities,
        portfolio: portfolioSummary,
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 600); // Small artificial delay for natural feel
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.avatarAssistant}>
                  <Text style={styles.avatarEmoji}>🤖</Text>
                </View>
              )}
              
              <View style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant
              ]}>
                {msg.role === 'assistant' ? (
                  <Markdown style={markdownStyles}>
                    {msg.content}
                  </Markdown>
                ) : (
                  <Text style={styles.bubbleTextUser}>{msg.content}</Text>
                )}
                <Text style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowAssistant]}>
              <View style={styles.avatarAssistant}>
                <Text style={styles.avatarEmoji}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
                <ActivityIndicator color={Colors.gold} size="small" />
              </View>
            </View>
          )}

          {/* Quick Actions (only show if last message was from assistant and not typing) */}
          {!isTyping && messages[messages.length - 1].role === 'assistant' && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.quickActionsScroll}
              contentContainerStyle={styles.quickActionsContainer}
            >
              {QUICK_ACTIONS.map((action, i) => (
                <Pressable
                  key={i}
                  style={styles.quickActionBtn}
                  onPress={() => handleSend(action.query)}
                >
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask about prices, trends, or your portfolio..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
          />
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={styles.sendBtnEmoji}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoid: { flex: 1 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { color: Colors.gold, fontSize: 24 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  onlineIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.bullish },
  
  chatContent: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xl },
  
  messageRow: { flexDirection: 'row', marginBottom: Spacing.sm, maxWidth: '85%' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageRowAssistant: { alignSelf: 'flex-start' },
  
  avatarAssistant: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.glass, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.glassBorder },
  avatarEmoji: { fontSize: 16 },
  
  bubble: { padding: Spacing.md, borderRadius: BorderRadius.lg },
  bubbleUser: { backgroundColor: Colors.goldMuted, borderBottomRightRadius: 4, borderWidth: 1, borderColor: Colors.gold + '40' },
  bubbleAssistant: { backgroundColor: Colors.glass, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.glassBorder },
  typingBubble: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  
  bubbleTextUser: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.regular, color: Colors.gold, lineHeight: 22 },
  timestamp: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  
  quickActionsScroll: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  quickActionsContainer: { gap: Spacing.sm, paddingRight: Spacing.xl },
  quickActionBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.gold + '40' },
  quickActionText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.gold },
  
  inputArea: { flexDirection: 'row', padding: Spacing.base, backgroundColor: Colors.surfaceElevated, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'flex-end', gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.glass, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.glassBorder, padding: Spacing.md, paddingTop: Spacing.md, color: Colors.textPrimary, fontFamily: Typography.fonts.regular, fontSize: Typography.sizes.base, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: Colors.glassBorder },
  sendBtnEmoji: { fontSize: 20, color: '#000', fontWeight: 'bold' },
});

const markdownStyles = StyleSheet.create({
  body: { color: Colors.textSecondary, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.regular, lineHeight: 22 },
  strong: { fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  em: { fontFamily: Typography.fonts.medium, fontStyle: 'italic' },
  table: { borderColor: Colors.border, borderWidth: 1, borderRadius: 4 },
  tr: { borderBottomWidth: 1, borderColor: Colors.border, flexDirection: 'row' },
  td: { padding: 4, borderColor: Colors.border },
  th: { padding: 4, borderColor: Colors.border, fontFamily: Typography.fonts.bold },
});
