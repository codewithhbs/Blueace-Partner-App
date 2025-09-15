"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useRoute } from "@react-navigation/native"

interface ErrorCode {
  _id: string
  Heading: {
    _id: string
    title: string
  }
  code: string
  description: string
  note: string[]
}

interface RouteParams {
  id: string
}

export default function Watch_Codes() {
  const route = useRoute()
  const { id } = route.params as RouteParams

  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleFetchData = useCallback(async () => {
    try {
      const response = await fetch(`https://api.blueaceindia.com/api/v1/get-order-by-id/${id}`)
      const data = await response.json()
      if (data.success) {
        setErrorCodes(data.data.errorCode)
      } else {
        setError("Failed to fetch error codes")
      }
    } catch (error) {
      console.error("Internal server error", error)
      setError("An error occurred while fetching data")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    handleFetchData()
  }, [handleFetchData])

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Error Codes</Text>
      {errorCodes.map((errorCode) => (
        <View key={errorCode._id} style={styles.errorCodeContainer}>
          <Text style={styles.heading}>{errorCode.Heading.title}</Text>
          <View style={styles.codeDescriptionContainer}>
            <Text style={styles.code}>{errorCode.code}</Text>
            <Text style={styles.description}>{errorCode.description}</Text>
          </View>
          {errorCode.note.length > 0 && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Notes:</Text>
              {errorCode.note.map((note, index) => (
                <Text key={index} style={styles.note}>
                  • {note}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  errorCodeContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0066cc",
  },
  codeDescriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginRight: 8,
  },
  description: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#666",
  },
  note: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
  },
})

