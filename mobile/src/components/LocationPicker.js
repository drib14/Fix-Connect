import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { MapPin, Navigation, Check, Search } from "lucide-react-native";
import {
  searchAddressLocationIQ,
  getCurrentLocation,
} from "../services/locationService";

export default function LocationPicker({
  initialAddress = "",
  onLocationSelect,
  placeholder = "Search location address...",
  label = "Service Location Address",
}) {
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Timer ref for 400ms input debouncing
  const debounceTimer = useRef(null);

  useEffect(() => {
    setAddressInput(initialAddress);
  }, [initialAddress]);

  const handleInputChange = (text) => {
    setAddressInput(text);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce API requests by 400ms
    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddressLocationIQ(text);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSearching(false);
    }, 400);
  };

  const handleSelectSuggestion = (item) => {
    const formattedAddress = item.display_name;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setAddressInput(formattedAddress);
    setSuggestions([]);
    setShowDropdown(false);

    if (onLocationSelect) {
      onLocationSelect({
        address: formattedAddress,
        coordinates: [lon, lat],
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    setGeolocating(true);
    setSuggestions([]);
    setShowDropdown(false);

    try {
      const loc = await getCurrentLocation();
      setAddressInput(loc.address);
      if (onLocationSelect) {
        onLocationSelect(loc);
      }
    } catch (err) {
      console.warn("Location error:", err.message);
    } finally {
      setGeolocating(false);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Input Row */}
      <View style={styles.inputContainer}>
        <MapPin color="#22C55E" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={addressInput}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />
        {searching && (
          <ActivityIndicator color="#22C55E" size="small" style={{ marginRight: 8 }} />
        )}
        <TouchableOpacity
          style={styles.currentLocBtn}
          onPress={handleUseCurrentLocation}
          disabled={geolocating}
        >
          {geolocating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Navigation color="#FFFFFF" size={16} />
          )}
        </TouchableOpacity>
      </View>

      {/* Action Button Label */}
      <TouchableOpacity
        style={styles.locationLinkBtn}
        onPress={handleUseCurrentLocation}
        disabled={geolocating}
      >
        <Navigation color="#22C55E" size={14} />
        <Text style={styles.locationLinkText}>
          {geolocating ? "Detecting your current location..." : "Press to auto-fill current GPS location"}
        </Text>
      </TouchableOpacity>

      {/* Real-time LocationIQ Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={item.place_id || index}
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Search color="#94A3B8" size={16} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle} numberOfLines={2}>
                  {item.display_name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 100,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CBD5E1",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 14,
  },
  currentLocBtn: {
    backgroundColor: "#16A34A",
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  locationLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
    paddingHorizontal: 4,
  },
  locationLinkText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "#11221A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#16A34A",
    marginTop: 6,
    overflow: "hidden",
    elevation: 5,
    zIndex: 999,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E3A2F",
  },
  suggestionTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    lineHeight: 18,
  },
});
