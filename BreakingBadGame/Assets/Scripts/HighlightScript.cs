using UnityEngine;
using TMPro;

public class HighlightScript : MonoBehaviour
{
    private GameObject currentHighlightedObject;
    private Material originalMaterial;
    public Color highlightColor = Color.yellow;
    public TextMeshProUGUI text;

    private void Update()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit))
        {
            if (hit.transform.tag != "Interactable")
                return;

            if (hit.transform.GetComponent<PickBeaker>() != null)
            {
                text.text = hit.transform.GetComponent<PickBeaker>().liquidType.ToString();
            }
            else
            {
                text.text = "";
            }

            GameObject hitObject = hit.transform.gameObject;

            if (currentHighlightedObject != hitObject)
            {
                ResetHighlight();

                Renderer renderer = hitObject.GetComponent<Renderer>();
                if (renderer != null)
                {
                    originalMaterial = renderer.material;
                    Material highlightMaterial = new Material(originalMaterial);
                    highlightMaterial.EnableKeyword("_EMISSION");
                    highlightMaterial.SetColor("_EmissionColor", highlightColor);
                    renderer.material = highlightMaterial;

                    currentHighlightedObject = hitObject;
                }
            }
        }
        else
        {
            ResetHighlight();
            text.text = "";
        }
    }

    private void ResetHighlight()
    {
        if (currentHighlightedObject != null)
        {
            Renderer renderer = currentHighlightedObject.GetComponent<Renderer>();
            if (renderer != null && originalMaterial != null)
            {
                renderer.material = originalMaterial;
            }
            currentHighlightedObject = null;
            originalMaterial = null;
        }
    }
}