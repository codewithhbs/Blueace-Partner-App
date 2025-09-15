"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Text } from "react-native"
import { Audio } from "expo-av"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { colors } from "~/colors/Colors"

interface VoicePlayProps {
    voiceUrl: string
    fileName?: string
}

interface PlaybackStatus {
    isLoaded: boolean
    isPlaying: boolean
    durationMillis?: number
    positionMillis?: number
    didJustFinish?: boolean
}

export default function VoicePlay({ voiceUrl, fileName = "Voice Message" }: VoicePlayProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [duration, setDuration] = useState<number>(0)
    const [position, setPosition] = useState<number>(0)
    const isMounted = useRef(true)

    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const onPlaybackStatusUpdate = useCallback((status: PlaybackStatus) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying)
            if (status.durationMillis) {
                setDuration(status.durationMillis)
            }
            if (status.positionMillis) {
                setPosition(status.positionMillis)
            }
            if (status.didJustFinish) {
                setIsPlaying(false)
                setPosition(0)
            }
        }
    }, [])

    const loadSound = useCallback(async () => {
        if (!isMounted.current) return

        try {
            setIsLoading(true)
            setError(null)

            const { sound: audioSound } = await Audio.Sound.createAsync(
                { uri: voiceUrl },
                { shouldPlay: false },
                onPlaybackStatusUpdate,
            )

            if (isMounted.current) {
                setSound(audioSound)
            } else {
                audioSound.unloadAsync()
            }
        } catch (err) {
            if (isMounted.current) {
                setError("Failed to load audio")
                console.error("Error loading sound:", err)
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false)
            }
        }
    }, [voiceUrl, onPlaybackStatusUpdate])

    const handlePlayPause = async () => {
        try {
            if (sound === null) {
                await loadSound()
                return
            }

            if (isPlaying) {
                await sound.pauseAsync()
            } else {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                })
                await sound.playAsync()
            }
        } catch (err) {
            setError("Failed to play/pause audio")
            console.error("Error playing/pausing:", err)
        }
    }

    useEffect(() => {
        if (voiceUrl) {
            loadSound()
        }
        return () => {
            isMounted.current = false
            if (sound) {
                sound.unloadAsync()
            }
        }
    }, [voiceUrl, loadSound, sound])

    if (!voiceUrl) {
        return null
    }

    return (
        <View style={styles.container}>
            <View style={styles.playerContainer}>
                <TouchableOpacity onPress={handlePlayPause} disabled={isLoading || !!error} style={styles.playButton}>
                    {isLoading ? (
                        <ActivityIndicator color="#2563eb" size={24} />
                    ) : (
                        <MaterialCommunityIcons name={isPlaying ? "pause-circle" : "play-circle"} size={48} color="#2563eb" />
                    )}
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                    <Text style={styles.fileName} numberOfLines={1}>
                        {fileName}
                    </Text>
                    <Text style={styles.timer}>
                        {formatTime(position)} / {formatTime(duration)}
                    </Text>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        backgroundColor: colors.white,
    },
    playerContainer: {
        flexDirection: "row",
        alignItems: "center",

        borderRadius: 12,
        padding: 12,
    },
    playButton: {
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: "center",
    },
    fileName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1f2937",
        marginBottom: 4,
    },
    timer: {
        fontSize: 14,
        color: "#6b7280",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 14,
        marginLeft: 8,
    },
})

