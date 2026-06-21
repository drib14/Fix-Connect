import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  Image,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { COLORS, FONTS, SPACING, ROUNDING } from '../theme';
import { getApiClient } from '../utils/api';
import useStore from '../store/useStore';

const ChatModal = ({ visible, onClose, bookingId, partnerName, partnerAvatar }) => {
  const { getToken } = useAuth();
  const { user } = useStore();
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch messages from booking chat array
  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get(`/bookings/${bookingId}`);
      if (response.data && response.data.chat) {
        setMessages(response.data.chat);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err.message);
    }
  };

  useEffect(() => {
    if (visible && bookingId) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
      
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [visible, bookingId]);

  // Send message
  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgContent = text.trim();
    setText('');
    setSending(true);

    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.post(`/bookings/${bookingId}/chat`, { message: msgContent });
      if (response.data && response.data.chat) {
        setMessages(response.data.chat);
        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error('Failed to send chat message:', err.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    // Check if the current user is the sender
    const isMe = item.sender === user?._id || (item.sender?._id === user?._id);
    const senderName = isMe ? 'You' : partnerName;

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        {!isMe && (
          <Image 
            source={{ uri: partnerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(partnerName) }} 
            style={styles.chatAvatar} 
          />
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>
            {item.message}
          </Text>
          <Text style={[styles.timestampText, isMe ? styles.timestampRight : styles.timestampLeft]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image 
                source={{ uri: partnerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(partnerName) }} 
                style={styles.partnerAvatar} 
              />
              <View>
                <Text style={styles.partnerName}>{partnerName}</Text>
                <Text style={styles.partnerStatus}>Active Conversation</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Message List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item._id || item.timestamp}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}

          {/* Input Bar */}
          <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
            <TextInput
              style={styles.input}
              placeholder="Type your message here..."
              placeholderTextColor={COLORS.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={200}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} 
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  partnerName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  partnerStatus: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ROUNDING.sm,
    backgroundColor: '#f1f5f9',
  },
  closeBtnText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '80%',
  },
  messageRowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  messageRowRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  bubble: {
    borderRadius: ROUNDING.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2,
    ...COLORS.cardShadow,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
    ...COLORS.glassShadow,
  },
  messageText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: COLORS.textDark,
  },
  messageTextRight: {
    color: '#fff',
  },
  timestampText: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  timestampLeft: {
    color: COLORS.textMuted,
    textAlign: 'left',
  },
  timestampRight: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: FONTS.regular,
    backgroundColor: '#f8fafc',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...COLORS.glassShadow,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});

export default ChatModal;
