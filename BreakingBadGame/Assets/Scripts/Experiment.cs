using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.SceneManagement;

public class Experiment : MonoBehaviour
{
    [SerializeField]
    private List<LiquidType> liquidTypes;
    [SerializeField]
    private Material material;
    [SerializeField]
    private float pourTime = 1.0f;
    [SerializeField]
    private AudioClip explodeSound;
    [SerializeField]
    private AudioClip pourSound;
    [SerializeField]
    private GameObject explodeFx;
    private int liquids = 0;

    private void Start()
    {
        liquidTypes = new List<LiquidType>();
        material.SetFloat("_Fill", 0.0f);
        material.SetColor("_Colour", Color.white);
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            RestartScene();
        }
    }

    public void LiquidPoured(LiquidType liquid)
    {
        if (liquids >= 2)
        {
            Debug.Log("All liquids poured!");
            return;
        }

        AudioManager.instance.PlayAudio(pourSound, 1.0f, true, 10.0f, transform.position);

        liquidTypes.Add(liquid);
        liquids++;

        if (liquids == 1)
        {
            if (liquid == LiquidType.Copper)
                material.SetColor("_Colour", Color.red);
            else if (liquid == LiquidType.NitricAcid)
                material.SetColor("_Colour", Color.green);
            else if (liquid == LiquidType.Iron)
                material.SetColor("_Colour", Color.blue);
            else if (liquid == LiquidType.SilverNitrate)
                material.SetColor("_Colour", Color.yellow);
            else if (liquid == LiquidType.Potassium)
                material.SetColor("_Colour", Color.magenta);
            else if (liquid == LiquidType.Water)
                material.SetColor("_Colour", Color.cyan);
            else if (liquid == LiquidType.SodiumChloride)
                material.SetColor("_Colour", Color.white);
            else if (liquid == LiquidType.Chlorine)
                material.SetColor("_Colour", Color.green);
            else if (liquid == LiquidType.Hcl)
                material.SetColor("_Colour", Color.white);
        }

        StartCoroutine(LiquidFill());

        // If two liquids are poured, check for reaction and change color and for water and potassium perform explosion
        if (liquids == 2)
        {
            CheckReaction();
        }
    }

    private void CheckReaction()
    {
        LiquidType a = liquidTypes[0];
        LiquidType b = liquidTypes[1];

        if ((a == LiquidType.Copper && b == LiquidType.NitricAcid) || (a == LiquidType.NitricAcid && b == LiquidType.Copper))
        {
            material.SetColor("_Colour", new Color(0.2f, 0.6f, 0.8f)); // Blue-green
        }
        else if ((a == LiquidType.Iron && b == LiquidType.Copper) || (a == LiquidType.Copper && b == LiquidType.Iron))
        {
            material.SetColor("_Colour", Color.grey); // Colorless, could use clear/grey
        }
        else if ((a == LiquidType.SilverNitrate && b == LiquidType.SodiumChloride) || (a == LiquidType.SodiumChloride && b == LiquidType.SilverNitrate))
        {
            material.SetColor("_Colour", new Color(0.3f, 0.3f, 0.3f)); // Silver precipitate turning dark
        }
        else if ((a == LiquidType.Potassium && b == LiquidType.Water) || (a == LiquidType.Water && b == LiquidType.Potassium))
        {
            Invoke("RestartScene", 2.0f); // Restart scene after 2 seconds
            AudioManager.instance.PlayAudio(explodeSound, 1.0f, true, 10.0f, transform.position);
            Debug.Log("💥 BOOM! Potassium exploded in water!");
            Instantiate(explodeFx, transform.position, Quaternion.identity);
            material.SetColor("_Colour", Color.red); // After explosion, maybe red hot or fire glow
        }
        else if ((a == LiquidType.Iron && b == LiquidType.Chlorine) || (a == LiquidType.Chlorine && b == LiquidType.Iron))
        {
            material.SetColor("_Colour", new Color(0.6f, 0.4f, 0.1f)); // Brown-yellow
        }
        else if ((a == LiquidType.Hcl && b == LiquidType.SodiumChloride) || (a == LiquidType.SodiumChloride && b == LiquidType.Hcl))
        {
            material.SetColor("_Colour", new Color(1.0f, 0.4f, 0.7f)); // Pink color for titration reaction
            Debug.Log("HCl and NaOH reacted to form a pink solution!");
        }
        else
        {
            material.SetColor("_Colour", Color.black);
        }
    }

    private void RestartScene()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    private IEnumerator LiquidFill()
    {
        float startFill = material.GetFloat("_Fill");
        float endFill = startFill + 0.1f;
        float elapsedTime = 0.0f;
        while (elapsedTime < pourTime)
        {
            elapsedTime += Time.deltaTime;
            float fill = Mathf.Lerp(startFill, endFill, elapsedTime / pourTime);
            material.SetFloat("_Fill", fill);
            yield return new WaitForSeconds(Time.deltaTime);
        }
    }
}
