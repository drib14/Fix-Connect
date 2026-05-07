import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TextInput, IconButton, Text, Surface } from 'react-native-paper';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';

const ChatInterface = ({ bookingId }) => {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    if (socket) {
      socket.emit('joinBooking', bookingId);

      const handleNewMessage = (message) => {
        setMessages((prev) => [...prev, message]);
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, bookingId]);

  useEffect(() => {
      api.get(`/chat/${bookingId}`).then(res => {
          if(res.data.success) setMessages(res.data.data);
      }).catch(err => console.error(err));
  }, [bookingId]);

  const sendMessage = async () => {
    if (inputText.trim()) {
      try {
        await api.post(`/chat/${bookingId}`, { message: inputText });
        setInputText('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender._id === (user._id || user.id);
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageMe : styles.messageOther]}>
        <Text style={styles.senderName}>{isMe ? 'You' : item.sender.firstName}</Text>
        <Surface style={[styles.messageSurface, isMe ? styles.surfaceMe : styles.surfaceOther]}>
          <Text style={isMe ? styles.textMe : styles.textOther}>{item.message}</Text>
        </Surface>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          mode="outlined"
          dense
        />
        <IconButton icon="send" size={24} onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 10 },
  messageWrapper: { marginVertical: 5, maxWidth: '80%' },
  messageMe: { alignSelf: 'flex-end' },
  messageOther: { alignSelf: 'flex-start' },
  senderName: { fontSize: 10, color: 'gray', marginBottom: 2, marginHorizontal: 5 },
  messageSurface: { padding: 10, borderRadius: 10, elevation: 1 },
  surfaceMe: { backgroundColor: '#00897b' },
  surfaceOther: { backgroundColor: '#e0e0e0' },
  textMe: { color: '#fff' },
  textOther: { color: '#000' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: { flex: 1, marginRight: 5 }
});

export default ChatInterface;
