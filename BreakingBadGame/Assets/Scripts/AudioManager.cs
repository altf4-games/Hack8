using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

public class AudioManager : MonoBehaviour
{
    public static AudioManager instance;
    public AudioMixerGroup mixer;

    private void Awake()
    {
        if (instance == null) instance = this;
        else Destroy(gameObject);
        //DontDestroyOnLoad(gameObject);
    }

    public void PlayAudio(AudioClip clip, float volume, bool? d3d9 = false, float maxDistance = default(float), Vector3 pos = default(Vector3))
    {
        if ((bool)d3d9 == true)
        {
            Play3DAudio(clip, volume, pos, maxDistance);
            return;
        }
        AudioSource audio = gameObject.AddComponent<AudioSource>();
        audio.outputAudioMixerGroup = mixer;
        audio.clip = clip;
        audio.volume = volume;
        audio.Play();
        Destroy(audio, clip.length);
    }

    private void Play3DAudio(AudioClip clip, float volume, Vector3 pos, float maxDistance)
    {
        GameObject go = new GameObject();
        AudioSource audio = go.AddComponent<AudioSource>();
        audio.outputAudioMixerGroup = mixer;
        audio.clip = clip;
        audio.volume = volume;
        audio.spatialBlend = 1;
        audio.rolloffMode = AudioRolloffMode.Linear;
        audio.maxDistance = maxDistance;
        go.transform.position = pos;
        go.transform.parent = transform;
        go.name = clip.name;
        audio.Play();
        Destroy(go, clip.length);
    }
}