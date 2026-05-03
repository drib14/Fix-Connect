import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import api from '../api/axios';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import { Send } from 'lucide-react-native';

const ChatInterface = ({ bookingId, status, updatedAt }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (status === 'completed' && updatedAt) {
      const completedTime = new Date(updatedAt).getTime();
      const now = new Date().getTime();
      if ((now - completedTime) > 24 * 60 * 60 * 1000) setIsLocked(true);
    }
  }, [status, updatedAt]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/${bookingId}`);
        if (data.success) setMessages(data.data);
      } catch (error) { console.error(error); }
    };
    fetchMessages();

    if (socket) {
      socket.emit('joinBooking', bookingId);
      socket.on('receiveMessage', (message) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });
    }
    return () => { if (socket) socket.off('receiveMessage'); };
  }, [bookingId, socket]);

  const sendMessage = async () => {
    if (!input.trim() || isLocked) return;
    try {
      await api.post(`/chat/${bookingId}`, { content: input });
      setInput('');
    } catch (error) { console.error('Send message error', error); }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isMine = item.sender._id === user._id;
          return (
            <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
              {!isMine && <Text style={styles.senderName}>{item.sender.firstName}</Text>}
              <Text style={isMine ? styles.myText : styles.theirText}>{item.content}</Text>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {isLocked ? (
        <View style={styles.lockedContainer}><Text style={styles.lockedText}>Chat locked. 24 hours passed since completion.</Text></View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor="#888" />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}><Send color="#fff" size={20} /></TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  messageBubble: { padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: '80%' },
  myMessage: { backgroundColor: '#10b981', alignSelf: 'flex-end', marginRight: 10 },
  theirMessage: { backgroundColor: '#374151', alignSelf: 'flex-start', marginLeft: 10 },
  myText: { color: '#fff' },
  theirText: { color: '#fff' },
  senderName: { color: '#9ca3af', fontSize: 10, marginBottom: 2 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#1f2937' },
  input: { flex: 1, backgroundColor: '#374151', color: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10 },
  sendBtn: { backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', width: 45, height: 45, borderRadius: 25, marginLeft: 10 },
  lockedContainer: { padding: 15, alignItems: 'center', backgroundColor: '#374151' },
  lockedText: { color: '#ef4444', fontWeight: 'bold' }
});

export default ChatInterface;
